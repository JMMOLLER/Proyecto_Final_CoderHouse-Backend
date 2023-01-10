require('dotenv').config();
const express = require('express');
const API_USER = express.Router();
const { BD_Carrito } = require('../DB/DAOs/Carrito.daos');
const { BD_Autores_Local } = require('../DB/DAOs/Usuarios_Local');
const { sendSMS } = require('../Dependencies/Twilio');
const { sendMail } = require('../Dependencies/NodeMailer');


function isLogged(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.json({status: "ERROR", message: "Forbidden"});
}

async function sendMessages(USER){
    await sendMail({
        from: 'Tienda Tuya',
        to: process.env.MAIL_USER,
        subject: `Nuevo pedido del usuario ${USER.name}`,
        html: `<h1 style="color: blue; align-text: center">Nuevo Compra de Usuario</h1>
        <p>Nombre: ${USER.name}</p><p>Email: ${USER.email}</p>
        <p>Dirección: ${USER.address}</p>`
    });
    /* FOR SMS */
    await sendSMS({
        body: `Su pedido ha sido recibido y se encuentra en proceso`,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
        to: `${USER.phone_number}`
    });
    return;
    /* FOR WHATSAPP */
    // await sendSMS({
    //     from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    //     body: `Su pedido ha sido recibido y se encuentra en proceso`,
    //     to: `whatsapp:${USER.phone_number}`
    // });
}

API_USER.get('/login', function (req, res) {
    res.json({status: req.isAuthenticated()});
});

API_USER.post('/buy', isLogged, async(req, res) => {
    const cartID = await BD_Carrito.getIDcartByUserID(req.session.passport.user);
    const USER = await BD_Autores_Local.getById(req.session.passport.user);
    if(await BD_Carrito.deleteByID(cartID)){
        await sendMessages(USER);
        res.json({status: true,message: "OK"})
    }else{
        res.json({status: false,message: "ERROR"});
    }
});

module.exports = { API_USER }; 