const accountSid = 'AC6bf945d8d72903c03d704e53b2dbd645'
const authToken = '523f431d3df3b46102836ae8fffc0933'

const client = require('twilio')(accountSid,authToken);

client.messages.create({ 
    to: '+17783199820',
    from:'+16042435380' ,
    body: 'This is a test messgae for app to device test'
})

.then((message) => console.log(message.sid))