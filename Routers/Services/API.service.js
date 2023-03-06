require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const UploadsDir = path.join(__dirname, '../../public/uploads/');
const { BD_Productos } = require('../../DB/DAOs/Productos.daos');
const { sendSMS } = require('../../utils/Twilio');
const { sendMail } = require('../../utils/NodeMailer');

async function sendMessages({userInfo, cartInfo}){
    /* FOR NODEMAILER */
    await sendPurchaseMail({userInfo, cartInfo});
    /* FOR SMS */
    await sendSMSToUser(userInfo);
    return;
    /* FOR WHATSAPP */
    //await sendWhatsappToUser(USER);
}

async function deleteUserImg(currentUserImg){
    try{
        if(currentUserImg.indexOf('/uploads/')>-1 && currentUserImg.indexOf('default')==-1){
            currentUserImg = currentUserImg.substr(9);
            await fs.remove(UploadsDir + currentUserImg);
        }
    }catch(err){
        console.log(err);
    }
}

async function sendEmail(user_data){
    try{
        return await sendMail({
            from: 'Servidor Node.js',
            to: process.env.MAIL_USER,
            subject: 'Nuevo Registro',
            html: `<h1 style="color: blue; align-text: center">Nuevo usuario registrado</h1>
                <p>Nombre: ${user_data.name}</p>
                <p>Email: ${user_data.email}</p>
                <p>Dirección: ${user_data.address}</p>
                <p>Edad: ${user_data.age}</p>
                <p>Avatar: ${user_data.avatar}</p>`,
        });
    }catch(err){
        console.log(err);
    }
}

async function sendPurchaseMail({userInfo, cartInfo}){
    try{
        await sendMail({
            from: 'Tienda Tuya',
            to: process.env.MAIL_USER,
            subject: `Nuevo pedido del usuario ${userInfo.name}`,
            html: `<h1 style="color: blue; align-text: center">Nueva Compra de Usuario</h1>
                <p>Nombre: ${userInfo.name}</p>
                <p>Email: ${userInfo.email}</p>
                <p>Dirección: ${userInfo.address}</p>`,
        });
        const msg = await createMessageMail({
            typeShipping: cartInfo.shipping, 
            cartInfo
        });
        return await sendMail({
            from: 'Tienda Tuya',
            to: userInfo.email,
            subject: `Gracias por tu nueva compra, ${userInfo.name}`,
            html: `<style>
                    table, th {
                        border-bottom: 1px solid black;
                        border-collapse: collapse;
                    }.footer, .SubTotal td {
                        border-top: 1px solid black;
                        border-bottom: 1px solid black;
                    }th, td {
                        padding: 10px 30px;
                        text-align: center;
                    }
                </style>
                <table>
                    <tr>
                        <th>Productos</th>
                        <th>Cantidad</th>
                        <th>Precio por UND.</th>
                    </tr>
                    ${msg}
                </table>`,
        });
    }catch(err){
        console.log(err);
    }
};

async function createMessageMail({typeShipping, cartInfo}){
    let message = '', SubTotal = 0, Total = 0, Shipping = '0.00';
    if(typeShipping == '10'){
        Shipping = '10.00';
    }else if(typeShipping == '5'){
        Shipping = '5.00';
    }
    for(let i=0; i<cartInfo.productos.length; i++){
        const { id, quantity } = cartInfo.productos[i];
        const producto = await BD_Productos.getById(id);
        const { title, price } = producto;
        message += `<tr>
                <td>${title}</td>
                <td>${quantity}</td>
                <td>${price}</td>
            </tr>`;
        SubTotal += (price * quantity);
    }
    Total = (SubTotal + parseFloat(Shipping)).toFixed(2);
    message += `<tr class="footer">
            <th>SubTotal</th>
            <th></th>
            <td>${(SubTotal).toFixed(2)}</td>
        </tr>
        <tr class="footer">
            <th>Envío</th>
            <th></th>
            <td>${Shipping}</td>
        </tr>
        <tr class="footer">
            <th>Total</th>
            <th></th>
            <th>${Total}</th>
        </tr>`;
    return message;
}

async function sendSMSToUser(USER){
    try{
        if(validatePhoneE164(USER.phone_number)){
            return await sendSMS({
                body: `Su pedido ha sido recibido y se encuentra en proceso`,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                to: `${USER.phone_number}`
            });
        }else{
            console.log("\x1b[31m%s\x1b[0m", 'Invalid phone number');
        }
    }catch(err){
        console.log(err);
    }
}

async function sendWhatsappToUser(USER){
    try{
        return await sendSMS({
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            body: `Su pedido ha sido recibido y se encuentra en proceso`,
            to: `whatsapp:${USER.phone_number}`
        });
    }catch(err){
        console.log(err);
    }
}

const validatePhoneE164 = (phoneNumber) => {
    const regEx = /^\+[1-9]\d{10,14}$/;

    return regEx.test(phoneNumber);
};

/* ========== EXPORT ========== */
module.exports = { 
    sendMessages,
    sendPurchaseMail,
    sendSMSToUser, 
    sendWhatsappToUser,
    sendEmail,
    deleteUserImg,
    validatePhoneE164,
};