require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");
const jwt = require('jsonwebtoken');
const logger = require("../../utils/LoggerConfig");
const { sendSMS } = require("../../utils/Twilio");
const { sendMail } = require("../../utils/NodeMailer");

const getPulicPath = (e) => path.join(__dirname,"../../public",e);

const generateToken = (user) => {
    try{
        return jwt.sign({ user }, process.env.COOKIE_SECRET)
    }catch(err){
        logger.error(err);
    }
}

async function sendMessages(newOrder) {
    /* FOR NODEMAILER */
    await sendPurchaseMail(newOrder);
    /* FOR SMS */
    await sendSMSToUser(newOrder.user);
    return;
}

async function deleteUserImg(currentUserImg) {
    try {
        if (
            currentUserImg.indexOf("/uploads/") > -1 &&
            currentUserImg.indexOf("default") == -1
        ) {
            currentUserImg = currentUserImg.substr(9);
            const path = getPulicPath("/uploads/"+currentUserImg);
            await fs.remove(path);
            logger.info("Imagen de usuario eliminada");
        }
    } catch (err) {
        logger.error(err);
    }
}

async function sendEmail(user_data) {
    try {
        await sendMail({
            from: "Tienda Tuya",
            to: process.env.MAIL_USER,
            subject: "Nuevo Registro",
            html: `<h1 style="color: blue; align-text: center">Nuevo usuario registrado</h1>
                <p>Nombre: ${user_data.name}</p>
                <p>Email: ${user_data.email}</p>
                <p>Dirección: ${user_data.address}</p>
                <p>Edad: ${user_data.age}</p>
                <p>Avatar: ${user_data.avatar}</p>`,
        });
        logger.info("Email de registro a admin enviado");
        const msg = fs
            .readFileSync(
                getPulicPath("/assets/html/registrationUser.html"),"utf8"
            ).replaceAll("URLHOST", (process.env.URLHOST+"/productos"));
        await sendMail({
            from: "Tienda Tuya",
            to: user_data.email,
            subject: "Gracias por tu Registro",
            html: msg,
        });
        logger.info("Email de registro a usuario enviado");
        return;
    } catch (err) {
        logger.error(err);
    }
}

async function sendPurchaseMail(purchaseDetail) {
    try {
        await sendMail({
            from: "Tienda Tuya",
            to: process.env.MAIL_USER,
            subject: `Nuevo pedido del usuario ${purchaseDetail.user.name}`,
            html: `<h1 style="color: blue; align-text: center">Nueva Compra de Usuario</h1>
                <p>Nombre: ${purchaseDetail.user.name}</p>
                <p>Email: ${purchaseDetail.user.email}</p>
                <p>Dirección: ${purchaseDetail.user.address}</p>`,
        });

        logger.info("Email de compra a admin enviado");
        const msg = renderOrder(purchaseDetail);

        await sendMail({
            from: "Tienda Tuya",
            to: purchaseDetail.user.email,
            subject: `Gracias por tu nueva compra, ${purchaseDetail.user.name}`,
            html: msg,
        });

        logger.info("Email de compra a usuario enviado");
        return;
    } catch (err) {
        logger.error(err);
    }
}

function renderOrder(purchaseDetail){
    const productsRendered = renderProductsTemplate(purchaseDetail.products);
    const orderRendered = renderOrderTemplate(purchaseDetail);
    return orderRendered.replace("PRODUCTS_HERE", productsRendered);
}

function renderProductsTemplate(productsList) {
    try{
        const templateProduct = fs.readFileSync(getPulicPath('/assets/html/productsTemplate.html'), 'utf8');
        const productsRendered = productsList.map(product => {
            let html = templateProduct.replaceAll("THUMBNAIL_R", product.thumbnail);
            html = html.replaceAll("NAME_R", product.title);
            html = html.replaceAll("CODE_R", product.code);
            html = html.replaceAll("BRAND_R", product.brand);
            html = html.replaceAll("QUANTITY_R", product.quantity);
            html = html.replaceAll("PRICE_R", product.price);
            return html;
        }).join("");
        return productsRendered;
    }catch(err){
        logger.error(err);
    }
}


function renderOrderTemplate(orderDetail) {
    try{
        let templateOrder = fs.readFileSync(getPulicPath('/assets/html/billTemplate.html'), 'utf8');
        templateOrder = templateOrder.replaceAll("URLHOST", process.env.URLHOST);
        templateOrder = templateOrder.replace("SUBTOTAL_R", orderDetail.subTotal);
        templateOrder = templateOrder.replace("SHIPPING_R", orderDetail.shipping);
        templateOrder = templateOrder.replace("TOTAL_R", orderDetail.total);
        templateOrder = templateOrder.replace("USER_EMAIL_R", orderDetail.user.email);
        templateOrder = templateOrder.replaceAll("CODE_R", orderDetail.code);
        templateOrder = templateOrder.replaceAll("DATE_R", orderDetail.date);
        templateOrder = templateOrder.replace("SHIPPING_MTEHOD_R", orderDetail.shippingMethod);
        templateOrder = templateOrder.replace("ADDRESS_R", orderDetail.user.address);
        return templateOrder;
    }catch(err){
        logger.error(err);
    }
}

async function sendSMSToUser(USER) {
    try {
        if (validatePhoneE164(USER.phone_number)) {
            await sendSMS({
                body: `Su pedido ha sido recibido y se encuentra en proceso`,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                to: `${USER.phone_number}`,
            });
            logger.info("SMS enviado a usuario");
        } else {
            logger.warn("El número de teléfono no es válido");
        }
        return;
    } catch (err) {
        logger.error(err);
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
    sendEmail,
    deleteUserImg,
    validatePhoneE164,
    generateToken,
};
