let metrics = require('../Models/metrics');

// Add/update user table to record latest login
async function recordUserLogin(username, email) {
    let userID = null;
    try {
        let res = await metrics.insertUser(username, email);
        userID = res;
    } catch (err) {
        console.log('Entry already exists, updating entry');
        try {
            let res = await metrics.updateUser(username, email);
            userID = res;
        }
        catch (e) {
            console.log(e);
        }
    }
    console.log(userID);
}


recordUserLogin('test', 'test');
//metrics.log()

module.exports = {
    recordUserLogin
}