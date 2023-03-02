const Passport = require('passport');
const path = require('path');
const BaseDir = path.join(__dirname, '../');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const { UserModel } = require('../DB/models/UsuariosModel');
const { sendEmail } = require('../Routers/Services/API.service');

/* ========= FUNCTIONS ========= */

async function deleteUploadImg(req){
    if(req.body.avatar_type!="0"){
        req.body.avatar = req.file.filename;
        await fs.remove(BaseDir + '/public/uploads/' + req.file.filename);
    }
    return;
}

function checkUserAvatar(req){
    if(req.body.avatar_type!="0")
        if(req.file)
            req.body.avatar = "/uploads/" + req.file.filename;
        else
            req.body.avatar = "/uploads/default.png";
    else if(req.body.avatar == "")
        req.body.avatar = "/uploads/default.png";
}

/* ========= PASSPORT ========= */

/*
    NOTA: La función isValidPassword() se encuentra en el modelo 
        de usuario al igual que el método para convertir la 
        contraseña en hash.
*/

Passport.use('login', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'user_password'
}, async(req, email, user_password, done) => {
    try{

        console.log('\x1b[36m%s\x1b[0m', "Nueva autenticacion");
        mongoose.connect(process.env.MONGODB_URI);

        const user = await UserModel.findOne({email});

        if(!user){

            console.log('Usuario no encontrado '+email);
            return done(null, false, {message: 'Usuario no encontrado'});

        }if(!user.isValidPassword(user_password)){

            console.log('Contraseña invalida');
            return done(null, false, {message: 'Contraseña invalida'});

        }

        req.returnTo = req.session.returnTo;
        const { password, __v, ...userData } = user._doc;
        return done(null, userData);

    }catch(err){
        console.log(err);
        return done(err);
    }
}));

Passport.use('signup', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'user_password'
}, async(req, email, user_password, done) => {

    try{
        mongoose.connect(process.env.MONGODB_URI);
        const userExist = await UserModel.findOne({ email });

        if(userExist){
            await deleteUploadImg(req);
            console.log('Email ya registrado');
            return done(null, false, {message: 'Email ya registrado'});
        }

        checkUserAvatar(req);
        
        const {re_password, ...newUserData} = {...req.body};
        
        newUserData['password'] = user_password;
        delete newUserData['user_password'];
        
        const newUser = await UserModel.create(newUserData);

        const { password, __v, ...userData } = newUser._doc;

        sendEmail(userData);//No lleva await porque considero que no es necesario esperar a que se envie el correo para continuar
        
        return done(null, userData);
    }catch(err){
        await deleteUploadImg(req);
        console.log(err);
        return done(err);
    }

}));

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies)
        token = req.session.jwt;
    return token;
}

Passport.use(new JWTStrategy({
    secretOrKey: process.env.COOKIE_SECRET,
    jwtFromRequest:  cookieExtractor,
}, async (token, done) => {
    try {
        return done(null, token.user)
    } catch (err) {
        done(err);
    }
}))
