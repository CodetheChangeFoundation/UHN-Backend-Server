import metrics from "../database/postgres";
let cron = require("node-cron");
let fs = require("fs");
let nodemailer = require("nodemailer");
let converter = require("json-2-csv")
let zlib = require("zlib");

let metricDB = metrics.getMetrics();
let transporter = nodemailer.createTransport({
	service: process.env.METRIC_DATA_SERVICE,
	auth: {
		type: "OAuth2",
		user: process.env.METRIC_DATA_USER,
		clientId: process.env.METRIC_DATA_CLIENTID,
		clientSecret: process.env.METRIC_DATA_CLIENT_SECRET,
		refreshToken: process.env.METRIC_DATA_REFRESH_TOKEN,
		accessToken: process.env.METRIC_DATA_ACCESS_TOKEN
	}
});

async function sendDataDumpEmail() {
	let data = await getAllMetricData();
	let monthlyLogins = await getMonthlyLogins();

	data[0].monthly_unique_logins = monthlyLogins;

	converter.json2csv(data, function (err, csv) {
		if (err) {
			sendEmailError(err);
		} else {
			makeAndEmailCSV(csv);
		}
	})
} 

function makeAndEmailCSV(data) {
	let date = new Date()
	let year = String(date.getUTCFullYear())
	let month =  String(1+date.getUTCMonth()).padStart(2,0)
	let day = String(date.getUTCDate()-1).padStart(2,0)
	date = year + "-" + month + "-" + day;
	
	let filename = "./metricData/"+date+".csv";
	fs.writeFile(filename, data, (err) => {
		if (err) {
			sendEmailError(err);
		} else {
			zipAndSendFile(filename, date);
		}
	})
}

function zipAndSendFile(filename, date) {
	let gzip = zlib.createGzip();
	let extension = ".gz";

	let read = fs.createReadStream(filename);
	let write = fs.createWriteStream(filename+extension);

	read.pipe(gzip).pipe(write);

	sendEmailWithZip(filename+extension, date);
}

function sendEmailWithZip(file, date) {
	let message = {
		from: process.env.METRIC_DATA_USER,
		to: process.env.METRIC_DATA_RECEIVER,
		subject: "UHN App Backend Data Analytics for "+ date,
		attachments: [
			{
				path: file
			}
		]
	}

	transporter.sendMail(message, function (err) {
		if (err) {
			sendEmailError(err);
		}
	})
 
}

async function getAllMetricData() {
	let results = null;
	try {
		results = await metricDB.select(
      "u.id as User_ID",
      "mongoid as u_mongoid",
      "username as u_username",
      "lastlogin as u_lastlogin",
      "al.id as AlarmLog_ID",
      "userid as al_userid",
      "alarmstart as al_alarmStart",
      "alarmend as al_alarmEnd",
      "alarmsent as al_alarmSent",
      "rl.id as ResponseLog_ID",
      "responderid as rl_responderid",
      "alarmid as rl_alarmid",
      "alertresponse as rl_alertResponse",
      "responsetime as rl_responseTime",
      "arl.id as ArrivalLog_ID",
      "arl.responseid as arl_responseid",
      "arl.arrivaltime as arl_arrivalTime",
      "tl.id as TreatmentLog_ID",
      "tl.responseid as tl_responseid",
      "tl.alertsuccessful as tl_alertSuccessful",
      "tl.treatmenttime as tl_treatmentTime"
    )
		.from("users AS u")
    .fullOuterJoin("alarmlog as al", "u.mongoid", "al.userid")
    .fullOuterJoin("responselog as rl", "rl.alarmid", "al.id")
    .fullOuterJoin("arrivallog as arl", "rl.id", "arl.responseid")
		.fullOuterJoin("treatmentlog as tl", "rl.id", "tl.responseid")
		.whereRaw(
			"alarmstart >= current_timestamp at time zone 'utc' - interval '1' day - interval '4' hour \
				and alarmstart < current_timestamp at time zone 'utc' - interval '4' hour \
			or alarmend >= current_timestamp at time zone 'utc' - interval '1' day - interval '4' hour \
				and alarmend < current_timestamp at time zone 'utc' - interval '4' hour \
			or responsetime >= current_timestamp at time zone 'utc' - interval '1' day - interval '4' hour \
				and responsetime < current_timestamp at time zone 'utc' - interval '4' hour \
			or arrivaltime >= current_timestamp at time zone 'utc' - interval '1' day - interval '4' hour \
				and arrivaltime < current_timestamp at time zone 'utc' - interval '4' hour \
			or treatmenttime >= current_timestamp at time zone 'utc' - interval '1' day - interval '4' hour \
				and treatmenttime < current_timestamp at time zone 'utc' - interval '4' hour "
		);

		if (results.length === 0) {
			results = [{
				User_ID: null,
				u_mongoid: null,
				u_username: null,
				u_lastlogin: null,
				AlarmLog_ID: null,
				al_userid: null,
				al_alarmStart: null,
				al_alarmEnd: null,
				al_alarmSent: null,
				ResponseLog_ID: null,
				rl_responderid: null,
				rl_alarmid: null,
				rl_alertResponse: null,
				rl_responseTime: null,
				ArrivalLog_ID: null,
				arl_responseid: null,
				arl_arrivalTime: null,
				TreatmentLog_ID: null,
				tl_responseid: null,
				tl_alertSuccessful: null,
				tl_treatmentTime: null
			}]
		}
		
		return results;
	}
	catch (err) {
		sendEmailError(err);
	}
}

async function getMonthlyLogins() {
	let result = null;
	try {
		result = await metricDB("users").count("*").whereRaw(
			"lastLogin >= current_timestamp at time zone 'utc' - interval '30' day - interval '4' hour \
			and lastlogin < current_timestamp at time zone 'utc' - interval '4' hour"
		);
		
		result = result[0].count;

		return result;
	}
	catch (err) {
		sendEmailError(err);
	}
}

function sendPeriodicEmail() {

	cron.schedule('0 0 0 * * *', () => {
		console.log("Sending scheduled data analytics email...");
		sendDataDumpEmail()
	}, {
		timezone: "Atlantic/South_Georgia"
	})
}

function sendEmailError(err) {
	console.log(err);
	let message = {
		from: process.env.METRIC_DATA_USER,
		to: process.env.METRIC_DATA_RECEIVER,
		subject: "ERROR: UHN App Backend Data Analytics",
		text: "Unable to deliver data analytics due to the following error on backend server: \n\n" + err.message
	}

	transporter.sendMail(message, function (err) {
		if (err) {
			console.log(err)
		}
	})
}

module.exports = {
	sendPeriodicEmail,
	sendDataDumpEmail
}