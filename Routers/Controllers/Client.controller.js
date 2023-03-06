const Passport = require('passport');
const { BD_Productos } = require('../../DB/DAOs/Productos.daos');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.daos');
const jwt = require('jsonwebtoken');

/* =========== ROUTES =========== */
const home = async(req, res) => {
    Passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            res.render('index', {title: 'Home', layout: 'index'});
        }else {
            res.render('index', {title: 'Home', layout: 'index', user});
        }
    })(req, res);
};

const chat = async(req, res) => {
    res.render('index', {title: 'Chat', layout: 'chat', user: req.user});
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
}

/* =========== EXPORT =========== */
module.exports = {
    home,
    products,
    chat,
    user_profile,
    user_cart,
    login_get,
    fail_login,
    register_get,
    fail_register,
    fatal_error,
};
