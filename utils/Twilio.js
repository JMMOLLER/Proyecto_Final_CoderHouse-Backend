require('dotenv').config();
const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSID, authToken);

// client.messages.create({
//     from: `whatsapp:${process.env.TWILIO_TEST_PHONE_NUMBER}`,
//     body: 'Hola, soy un mensaje de prueba',
//     to: 'whatsapp:+51972131823'
// }).then(message =>{
//     console.log(`Mensaje enviado: ${message.sid}`);
// })

// client.messages.create({ 
//     body: 'Hola, este es un SMS de prueba.',  
//     messagingServiceSid: 'MG2b17473b1d09c0ed360e74a63eabb171',      
//     to: '+51972131823' 
// }) 
// .then(message => console.log(message.sid)) 
// .done();

let sendSMS = async (sendElement) => {
    new Promise((resolve, reject) => {
        try{
            client.messages.create(sendElement).then(
                message => resolve(console.log("Se envió el sms de compra con ID:" + message.sid))
            ).done();
        }catch(err){
            reject(err);
        }
    });
}

// try {
//     await client.messages.create(sendElement).then(
//         message => console.log(`Nuevo mensaje enviado: ${message.sid}`)
//     ).done();
// } catch (err) {
//     console.log(err);
// }
module.exports = { sendSMS };