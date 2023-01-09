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

// const mailOptions = {
//     from: 'Servidor Node.js',
//     to: TEST_MAIL,
//     subject: 'Mail de prueba desde Node.js',
//     html: '<h1 style="color: blue;">Contenido de prueba desde <span style="color: green;">Node.js con Nodemailer para la clase</span></h1>'
// }

let sendMail = async(mailOptions)=>{
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(info)
    } catch (err) {
        console.log(err)
    }
}

module.exports = { sendMail };