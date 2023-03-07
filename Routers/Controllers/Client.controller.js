const Passport = require('passport');
const { BD_Productos } = require('../../DB/DAOs/Productos.dao');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.dao');
const jwt = require('jsonwebtoken');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local.dao');

/* =========== ROUTES =========== */
const home = async(req, res) => {
    Passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            res.render('index', { title: 'Home', layout: 'index' });
        }else {
            res.render('index', { title: 'Home', layout: 'index', user });
        }
    })(req, res);
};

const chat = async(req, res) => {
    res.render('index', { title: 'Chat', layout: 'chat', user: req.user });
};

const getChat = async(req, res) => {
    let userChat = await BD_Usuarios_Local.getByEmail(req.params.mail);
    if(userChat){
        res.render('index', { title: `Chat de ${userChat.name}`, layout: 'getChat', user: req.user, userChat })
    }else{
        userChat = {};
        userChat.avatar = '/uploads/default.png';
        userChat.name = 'Usuario Desconocido';
        res.render('index', { title: 'Chat No encontrado', layout: 'getChat', user: req.user, userChat })
    }
};

const products = async(req, res) => {
    Passport.authenticate('jwt', { session: false }, async(err, user, info) => {
        const products= await BD_Productos.getAll();
        if (err || !user) {
            res.render('index', {
                title: 'Productos', 
                layout: 'products', 
                products: products
            });
        }else {
            res.render('index', {
                title: 'Productos',
                layout: 'products',
                products: products,
                user
            });
        }
    })(req, res);
};

const user_profile = async(req, res) => {
    res.render('index', {
        title: 'Perfil', 
        layout: 'user_profile', 
        user: req.user,
    });
};

const user_cart = async(req, res) => {
    try {
        const cart = await BD_Carrito.getCartByUserID(req.user._id);
        const products = await BD_Carrito.getInfoProducts(cart.productos);
        let total = 0
        products.forEach(product => {
            total += product.price * product.quantity;
        });
        res.render('index', {
            title: 'Carrito', 
            layout: 'user_cart', 
            products: products,
            cant: products.length,
            total: total.toFixed(2),
            user: req.user
        });
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m',error);
        res.render('index', { 
            title: 'Carrito', 
            layout: 'user_cart',
            user: req.user
        });
    }
};

const login_get = (req, res) => {
    res.render('index', {title: 'Login', layout: 'login'});
};    

const register_get = (req, res) => {
    res.render('index', {title: 'Regristro', layout: 'register'});
};

const fail_login = (req, res) => {
    res.render('index',{ layout: 'error_template', isLoginError: true, msg: req.query.err || 'Unknow Login Error' });
};

const fail_register = (req, res) => {
    res.render('index',{ layout: 'error_template', isLoginError: false, msg: req.query.err || 'Unknow Register Error' });
};

const fatal_error = (req, res) => {
    res.render('index',{ layout: 'error_template', isfatalError: true, msg: req.query.err || 'Unknow Fatal Error' });
};

const completeRegister = (req, res) => {
    res.render('index', { title: 'Completar Registro', layout: 'completeRegister' });
};

const register_twitter = (req, res) => {
    Passport.authenticate('twitter',{ session: false }, (err, user, info) => {
        if (err) { return res.redirect('/fail_login'); }
        if (!user) { return res.redirect('/fail_login'); }
        if((user.email).indexOf('@twitter.com') > -1){
            return res.redirect('/completeRegister/'+user._id);//Verificar si el usuario tiene sus datos completos
        }
        const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
        req.session.jwt = token
        return res.redirect('/user/profile')
    })(req, res)
}

const register_github = (req, res) => {
    Passport.authenticate('github',{ session: false }, (err, user, info) => {
        if (err) { return res.redirect('/fail_login'); }
        if (!user) { return res.redirect('/fail_login'); }
        if((user.email).indexOf('@github.com') > -1){
            return res.redirect('/completeRegister/'+user._id);//Verificar si el usuario tiene sus datos completos
        }
        const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
        req.session.jwt = token
        return res.redirect('/user/profile')
    })(req, res)
}

/* =========== EXPORT =========== */
module.exports = {
    home,
    products,
    chat,
    getChat,
    user_profile,
    user_cart,
    login_get,
    fail_login,
    register_get,
    fail_register,
    fatal_error,
    register_twitter,
    register_github,
    completeRegister,
};
