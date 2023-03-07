require("dotenv").config();
const fs = require("fs-extra");
const path = require("path");
const UploadsDir = path.join(__dirname, "../../public/uploads/");
const { BD_Productos } = require("../../DB/DAOs/Productos.dao");
const { sendSMS } = require("../../utils/Twilio");
const { sendMail } = require("../../utils/NodeMailer");

const getPulicPath = (e) => path.join(__dirname,"../../public/assets",e);

async function sendMessages(newOrder) {
    /* FOR NODEMAILER */
    await sendPurchaseMail(newOrder);
    /* FOR SMS */
    await sendSMSToUser(newOrder.user);
    return;
    /* FOR WHATSAPP */
    //await sendWhatsappToUser(USER);
}

async function deleteUserImg(currentUserImg) {
    try {
        if (
            currentUserImg.indexOf("/uploads/") > -1 &&
            currentUserImg.indexOf("default") == -1
        ) {
            currentUserImg = currentUserImg.substr(9);
            await fs.remove(UploadsDir + currentUserImg);
        }
    } catch (err) {
        console.log(err);
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

        const msg = fs
            .readFileSync(
                getPulicPath("/html/registrationUser.html"),"utf8"
            ).replaceAll("URLHOST", (process.env.URLHOST+"/productos"));
        await sendMail({
            from: "Tienda Tuya",
            to: user_data.email,
            subject: "Gracias por tu Registro",
            html: msg,
        });
        return;
    } catch (err) {
        console.log(err);
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
        const msg = renderOrder(purchaseDetail);
        return await sendMail({
            from: "Tienda Tuya",
            to: purchaseDetail.user.email,
            subject: `Gracias por tu nueva compra, ${purchaseDetail.user.name}`,
            html: msg,
        });
    } catch (err) {
        console.log(err);
    }
}

function renderOrder(purchaseDetail){
    const productsRendered = renderProductsTemplate(purchaseDetail.products);
    const orderRendered = renderOrderTemplate(purchaseDetail);
    return orderRendered.replace("PRODUCTS_HERE", productsRendered);
}

function renderProductsTemplate(productsList) {
    const templateProduct = fs.readFileSync(getPulicPath('/html/productsTemplate.html'), 'utf8');
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
}


function renderOrderTemplate(orderDetail) {
    let templateOrder = fs.readFileSync(getPulicPath('/html/billTemplate.html'), 'utf8');
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
}

async function sendSMSToUser(USER) {
    try {
        if (validatePhoneE164(USER.phone_number)) {
            return await sendSMS({
                body: `Su pedido ha sido recibido y se encuentra en proceso`,
                messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
                to: `${USER.phone_number}`,
            });
        } else {
            console.log("\x1b[31m%s\x1b[0m", "Invalid phone number");
        }
    } catch (err) {
        console.log(err);
    }
}

async function sendWhatsappToUser(USER) {
    try {
        return await sendSMS({
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            body: `Su pedido ha sido recibido y se encuentra en proceso`,
            to: `whatsapp:${USER.phone_number}`,
        });
    } catch (err) {
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
