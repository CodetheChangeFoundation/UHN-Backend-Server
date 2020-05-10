import metrics from "../database/postgres";
let fs = require("fs");
let nodemailer = require("nodemailer");
let converter = require("json-2-csv")

let metricDB = metrics.getMetrics();
let transporter = nodemailer.createTransport({
	service: process.env.METRIC_DATA_SERVICE,
	auth: {
		type: "OAuth2",
		user: process.env.METRIC_DATA_USER,
		clientId: process.env.METRIC_DATA_CLIENTID,
		clientSecret: process.env.METRIC_DATA_CLIENT_SECRET,
		refreshToken: process.env.METRIC_DATA_REFRESH_TOKEN,
		accessToken: process.env.METRIC_DATA_ACCESS_TOKEN,
		expires: 0
	}
});

async function sendDataDumpEmail() {
	let data = await getAllMetricData();
	console.log(data.length)

	converter.json2csv(data, function (err, csv) {
		if (err) {
			sendEmailError(err)
		} else {
			makeAndEmailCSV(csv)
		}
	})
} 

function makeAndEmailCSV(data) {
	let date = new Date()
	let year = String(date.getUTCFullYear())
	let month =  String(1+date.getUTCMonth()).padStart(2,0)
	let day = String(date.getUTCDate()).padStart(2,0)
	let hour = String(date.getUTCHours()).padStart(2,0)
	let min = String(date.getUTCMinutes()).padStart(2,0)
	let sec = String(date.getUTCSeconds()).padStart(2,0)
	let ms = String(date.getUTCMilliseconds()).padStart(3,0)
	date = year + month + day + "-" + hour + min + sec + ms;
	
	let filename = "./"+"test"+".csv";
	fs.writeFile(filename, data, (err) => {
		if (err) {
			sendEmailError(err);
		} else {
			sendEmailWithCSV(filename)
		}
	})
}

function sendEmailWithCSV(file) {
	let message = {
		from: process.env.METRIC_DATA_USER,
		to: process.env.METRIC_DATA_RECEIVER,
		subject: "UHN App Backend Data Analytics for "+ file,
		attachments: [
			{
				path: "./test.csv"
			}
		]
	}

	transporter.sendMail(message, function (err, info) {
		if (err) {
			console.log(err)
		}
		else console.log(info)
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
		.fullOuterJoin("treatmentlog as tl", "rl.id", "tl.responseid");
		
		return results;
	}
	catch (err) {
		sendEmailError(err);
	}
}

function sendEmailError(err) {
	console.log(err);
	let message = {
		from: process.env.METRIC_DATA_USER,
		to: process.env.METRIC_DATA_RECEIVER,
		subject: "Error: UHN App Backend Data Analytics",
		text: "Unable to deliver data analytics due to error on backend server: \n" + err.message
	}

	transporter.sendMail(message, function (err, info) {
		if (err) {
			console.log(err)
		}
		else console.log(info)
	})
}

module.exports = {
	sendDataDumpEmail
}