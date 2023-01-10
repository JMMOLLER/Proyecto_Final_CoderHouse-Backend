require('dotenv').config();
const { createTransport } = require('nodemailer');

const TEST_MAIL = process.env.MAIL_USER;

const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: TEST_MAIL,
        pass: process.env.MAIL_PASS
    }
});


let sendMail = async(mailOptions)=>{
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(info)
    } catch (err) {
        console.log(err)
    }
}

module.exports = { sendMail };