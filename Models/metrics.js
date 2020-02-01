let metrics = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL
})

async function log() {
    metrics('users').then(res => console.log(res));
}

// Inserts username, email and timestamp into users table, 
// returns ID of new entry
async function insertUser(username, email) {
    let newID = null;
    try {
        await metrics('users').insert({
            username: username,
            email: email,
            lastlogin: metrics.fn.now()
        }).returning("*").then(res => {
            newID = res;
        });
    } catch (err) {
        throw new Error(err);
    }
    return newID;
}

// Updates login timestamp of user with given username and email
// Returns ID of updated entry
async function updateUser(username, email) {
    let updatedID = null;
    try {
        await metrics('users').where({
            username: username
        }).andWhere({
            email: email
        }).update({
            lastlogin: metrics.fn.now()
        }).returning("id")
        .then(res => {
            updatedID = res;
        });
    } catch (err) {
        throw err;
    }
    return updatedID;
}

module.exports = {
    insertUser,
    updateUser,
    log
}
