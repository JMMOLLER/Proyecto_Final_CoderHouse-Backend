require('dotenv').config();
const logger = require("./LoggerConfig");
const { createTransport } = require('nodemailer');

const MAIL_USER = process.env.MAIL_USER;

const transporter = createTransport({
    service: process.env.MAIL_SERVICE,
    port: process.env.MAIL_PORT,
    auth: {
        user: MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});


let sendMail = async(mailOptions)=>{
    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email enviado: ${info.messageId}`);
    } catch (err) {
        logger.error(err);
    }
}

module.exports = { sendMail };