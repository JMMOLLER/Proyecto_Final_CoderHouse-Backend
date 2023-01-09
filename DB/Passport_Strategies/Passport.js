const Passport = require('passport');
const path = require('path');
const BaseDir = path.join(__dirname, '../');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const { UserModel } = require('../models/UsuariosModel');
const { sendMail } = require('../../NodeMailer/NodeMailer');
//const { BD_Autores_Local } = require('../DAOs/Usuarios_Local');
const bCrypt = require('bcrypt');

async function newUserEmail(user_data){
    return sendMail({
        from: 'Servidor Node.js',
        to: process.env.MAIL_USER,
        subject: 'Nuevo Registro',
        html: `
        <h1 style="color: blue; align-text: center">Nuevo usuario registrado</h1>
        <p>Nombre: ${user_data.name}</p><p>Email: ${user_data.email}</p>
        <p>Apellido: ${user_data.password}</p><p>Dirección: ${user_data.address}</p>
        <p>Edad: ${user_data.age}</p><p>Avatar: ${user_data.avatar}</p>
        `
    });
}

function createHash(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function isValidPassword(user, password){
	return bCrypt.compareSync(password, user.password);
}

Passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (username, password, done) => {
    console.log(username + '<-- DATOS -->' + password);
    mongoose.connect(process.env.MONGODB_URI);
    UserModel.findOne({email:username}, (err, user) => {
        if(err)return done(err);
        if(!user){
            console.log('Usuario no encontrado '+email);
            return done(null, false);
        }if(!isValidPassword(user, password)){
            console.log('Contraseña invalida');
            return done(null, false);
        }
        return done(null, user);
    });
}));

Passport.use('signup', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password'
}, (req, username, password, done) => {
    mongoose.connect(process.env.MONGODB_URI);
    UserModel.findOne({ email: req.body.email }, async(error, mail) => {
        if (error) {
            await fs.remove(BaseDir + '/public/uploads/' + req.file.filename);
            console.log('Error con el registro ' + error);
            return done(err);
        } if (mail) {
            await fs.remove(BaseDir + '/public/uploads/' + req.file.filename);
            console.log('Email ya registrado');
            return done(null, false);
        }
        if(req.body.avatar_type!="0")
            req.body.avatar = req.file.filename;
        const newUser = {
            address: req.body.address,
            password: createHash(req.body.password),
            email: req.body.email,
            name: req.body.name,
            age: req.body.age,
            avatar: req.body.avatar,
        };
        UserModel.create(newUser, async(err, userWithID) => {
            if (err) {
                console.log('Error al guardar el usuario: ' + err);
                await fs.remove(BaseDir + '/public/uploads/' + req.file.filename)
                return done(err);
            }
            console.log(userWithID);
            console.log('Registro de usuario completo');
            await newUserEmail(userWithID);
            return done(null, userWithID);
        });
    });

}
));


/* SERIALIZE & DESERIALIZE */
Passport.serializeUser((user, done) => {
    process.nextTick(() => done(null, user.id));
});

Passport.deserializeUser((id, done) => {
    mongoose.connect(process.env.MONGODB_URI);
    UserModel.findById(id, done);
});