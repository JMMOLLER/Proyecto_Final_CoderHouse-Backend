const Passport = require('passport');
const path = require('path');
const BaseDir = path.join(__dirname, '../');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const { UserModel } = require('../DB/models/UsuariosModel');
const { newUserEmail } = require('../Routers/Services/API.service');
const bCrypt = require('bcrypt');

/* ========= FUNCTIONS ========= */

function createHash(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function isValidPassword(user, password){
	return bCrypt.compareSync(password, user.password);
}

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

Passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (username, password, done) => {

    console.log(username + '<-- DATOS -->' + password);
    mongoose.connect(process.env.MONGODB_URI);

    UserModel.findOne({email:username}, (err, user) => {
        if(err)return done(err);
        if(!user){
            console.log('Usuario no encontrado '+username);
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
            await deleteUploadImg(req);
            console.log('Error con el registro ' + error);
            return done(err);
        } if (mail) {
            await deleteUploadImg(req);
            console.log('Email ya registrado');
            return done(null, false);
        }
        checkUserAvatar(req);
        const newUser = {
            address: req.body.address,
            password: createHash(req.body.password),
            email: req.body.email,
            name: req.body.name,
            age: req.body.age,
            avatar: req.body.avatar,
            phone_number: req.body.phone_number
        };
        UserModel.create(newUser, async(err, userWithID) => {
            if (err) {
                console.log('Error al guardar el usuario: ' + err);
                await deleteUploadImg(req);
                return done(err);
            }
            console.log('Registro de usuario completo');
            await newUserEmail(userWithID);
            return done(null, userWithID);
        });
    });

}));


/* SERIALIZE & DESERIALIZE */
Passport.serializeUser((user, done) => {
    /* A function that is executed asynchronously as soon as the current function is completed. */
    process.nextTick(() => done(null, {id: user._id, avatar: user.avatar}));
});

Passport.deserializeUser((user, done) => {
    mongoose.connect(process.env.MONGODB_URI);
    UserModel.findById(user.id, done);
});