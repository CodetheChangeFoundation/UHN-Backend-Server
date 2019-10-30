var bcrypt = require('bcrypt');
const saltRounds = 10;
var password = "1234"
var hash = bcrypt.hashSync(password, saltRounds);

console.log(hash);
