require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const UploadsDir = path.join(__dirname, '../../public/uploads/');
const { sendSMS } = require('../../utils/Twilio');
const { sendMail } = require('../../utils/NodeMailer');

async function sendMessages(USER){
    /* FOR NODEMAILER */
    await sendPurchaseMail(USER);
    /* FOR SMS */
    await sendSMSToUser(USER);
    return;
    /* FOR WHATSAPP */
    //await sendWhatsappToUser(USER);
}

async function deleteUserImg(currentUserImg){
    if(currentUserImg.indexOf('/uploads/')>-1 && currentUserImg.indexOf('default')==-1){
        currentUserImg = currentUserImg.substr(9);
        await fs.remove(UploadsDir + currentUserImg);
    }
}

async function newUserEmail(user_data){
    return await sendMail({
        from: 'Servidor Node.js',
        to: process.env.MAIL_USER,
        subject: 'Nuevo Registro',
        html: `
        <h1 style="color: blue; align-text: center">Nuevo usuario registrado</h1>
        <p>Nombre: ${user_data.name}</p><p>Email: ${user_data.email}</p>
        <p>Contraseña: ${user_data.password}</p><p>Dirección: ${user_data.address}</p>
        <p>Edad: ${user_data.age}</p><p>Avatar: ${user_data.avatar}</p>
        `
    });
}

async function sendPurchaseMail(USER){
    return await sendMail({
        from: 'Tienda Tuya',
        to: process.env.MAIL_USER,
        subject: `Nuevo pedido del usuario ${USER.name}`,
        html: `<h1 style="color: blue; align-text: center">Nuevo Compra de Usuario</h1>
        <p>Nombre: ${USER.name}</p><p>Email: ${USER.email}</p>
        <p>Dirección: ${USER.address}</p>`
    });
};

async function sendSMSToUser(USER){
    return await sendSMS({
        body: `Su pedido ha sido recibido y se encuentra en proceso`,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
        to: `${USER.phone_number}`
    });
}

async function sendWhatsappToUser(USER){
    return await sendSMS({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        body: `Su pedido ha sido recibido y se encuentra en proceso`,
        to: `whatsapp:${USER.phone_number}`
    });
}

/* ========== EXPORT ========== */
module.exports = { 
    sendMessages,
    sendPurchaseMail,
    sendSMSToUser, 
    sendWhatsappToUser,
    newUserEmail,
    deleteUserImg
};