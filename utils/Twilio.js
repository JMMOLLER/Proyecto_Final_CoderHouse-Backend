require('dotenv').config();
const logger = require("./LoggerConfig");
const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSID, authToken);


let sendSMS = async (sendElement) => {
    new Promise((resolve, reject) => {
        try{
            client.messages.create(sendElement).then(
                message => resolve(console.log("Se envió el sms de compra con ID:" + message.sid))
            ).done();
        }catch(err){
            logger.error(err);
            reject(err);
        }
    });
}

module.exports = { sendSMS };
