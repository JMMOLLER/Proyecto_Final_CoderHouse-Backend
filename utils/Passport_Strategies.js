const Passport = require("passport");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const { deleteUserImg } = require("../Routers/Services/API.service");
const { UserModel } = require("../DB/models/UsuariosModel");
const { sendEmail, validatePhoneE164 } = require("../Routers/Services/API.service");

/* ========= FUNCTIONS ========= */

function checkUserAvatar(req) {
    try{
        if (req.body.avatar_type != "0")
            if (req.file) req.body.avatar = "/uploads/" + req.file.filename;
            else req.body.avatar = "/uploads/default.png";
        else if (req.body.avatar == "") req.body.avatar = "/uploads/default.png";
    }catch(err){
        console.log(err);
    }
    return;
}

const validateNewUser = (user) => {
    if(!user.name){ return { value: false, msg: "Missing name" } }
    if(!user.email){ return { value: false, msg: "Missing email" } }
    if(!user.user_password){ return { value: false, msg: "Missing password" } }
    if(!user.address){ return { value: false, msg: "Missing address" } }
    if(!user.phone_number){ return { value: false, msg: "Missing phone number" } }
    if(!(user.avatar_type).toString()){ return { value: false, msg: "Missing avatar_type" } }
    if (user.user_password !== user.re_password) { return { value: false, msg: "Passwords don't match" } }
    return { value: true, msg: "User validated" };
};

/* ========= PASSPORT ========= */

/*
    NOTA: La función isValidPassword() se encuentra en el modelo 
        de usuario al igual que el método para convertir la 
        contraseña en hash.
*/

Passport.use(
    "login",
    new LocalStrategy(
        {
            passReqToCallback: true,
            usernameField: "email",
            passwordField: "user_password",
        },
        async (req, email, user_password, done) => {
            try {
                mongoose.connect(process.env.MONGODB_URI);
                
                const user = await UserModel.findOne({ email });
                
                if (!user) {
                    console.log("\x1b[31m%s\x1b[0m", "Usuario no encontrado " + email);
                    return done(null, false, {
                        message: "Usuario no encontrado",
                    });
                }
                if (!user.isValidPassword(user_password)) {
                    console.log("\x1b[31m%s\x1b[0m", "Contraseña invalida");
                    return done(null, false, {
                        message: "Contraseña invalida",
                    });
                }
                
                console.log("\x1b[36m%s\x1b[0m", "Nueva autenticacion");
                req.returnTo = req.session.returnTo;
                const { password, __v, ...userData } = user._doc;
                return done(null, userData);
            } catch (err) {
                console.log(err);
                return done(err);
            }
        }
    )
);

Passport.use(
    "register",
    new LocalStrategy(
        {
            passReqToCallback: true,
            usernameField: "email",
            passwordField: "user_password",
        },
        async (req, email, user_password, done) => {
            try {
                mongoose.connect(process.env.MONGODB_URI);
                const userExist = await UserModel.findOne({ email });

                if (userExist) {
                    if(req.body.avatar_type != "0"){
                        await deleteUserImg("/uploads/" + req.file.filename);
                    }
                    console.log("\x1b[31m%s\x1b[0m", "Email ya registrado");
                    return done(null, false, {
                        message: "Email already registered",
                    });
                }

                checkUserAvatar(req);//Verifica si el usuario subio una imagen o una url
                const response = validateNewUser(req.body)
                if (!response.value) {
                    if(req.body.avatar_type != "0"){
                        await deleteUserImg("/uploads/" + req.file.filename);
                    }
                    console.log("\x1b[31m%s\x1b[0m", response.msg);
                    return done(null, false, {
                        message: response.msg,
                    });
                }if(!validatePhoneE164(req.body.phone_number)){
                    if(req.body.avatar_type != "0"){
                        await deleteUserImg("/uploads/" + req.file.filename);
                    }
                    console.log("\x1b[31m%s\x1b[0m", "Invalid phone number");
                    return done(null, false, {
                        message: "Invalid phone number",
                    });
                }

                const {
                    avatar_type,
                    re_password,
                    user_password,
                    ...newUserData
                } = { ...req.body };

                newUserData["password"] = user_password;

                const newUser = await UserModel.create(newUserData);

                const { password, __v, ...userData } = newUser._doc;

                console.log("\x1b[36m%s\x1b[0m", "Nuevo registro");

                //sendEmail(userData); //No lleva await porque considero que no es necesario esperar a que se envie el correo para continuar

                return done(null, userData);
            } catch (err) {
                if(req.body.avatar_type != "0"){
                    await deleteUserImg("/uploads/" + req.file.filename);
                }
                console.log(err);
                return done(err);
            }
        }
    )
);

Passport.use(
    new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: process.env.TWITTER_CALLBACK_URL,
    },
    async (token, tokenSecret, profile, done) => {
        try{
            mongoose.connect(process.env.MONGODB_URI);
            const user = await UserModel.findOne({ twitterId: profile.id });
            if (user) return done(null, user);
            else {
                const newUser = await UserModel.create({
                    name: profile.username,
                    email: profile.username+"@twitter.com",
                    password: profile.id,
                    address: profile._json.location || "No address",
                    age: profile._json.age || 20,
                    phone_number: "+12125551212",
                    avatar: profile.photos[0].value || "/public/default.png",
                    twitterId: profile.id,

                });
                return done(null, newUser);
            }
        }catch(err){
            console.log(err);
            return done(null, false, { message: err.message });
        }
    })
);

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) token = req.session.jwt;
    return token;
};

Passport.use(
    new JWTStrategy(
        {
            secretOrKey: process.env.COOKIE_SECRET,
            jwtFromRequest: cookieExtractor,
        },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (err) {
                done(err);
            }
        }
    )
);
