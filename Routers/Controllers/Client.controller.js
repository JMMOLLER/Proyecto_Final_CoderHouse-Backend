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

const login_post = (req, res) => {
    Passport.authenticate('login', { session: false }, (err, user, info) => {
        if(err || !user){
          return res.status(400).render('index', {layout: 'error_template', err: true})
        }
        const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
        req.session.jwt = token
        return res.redirect(req.returnTo || '/user/profile')
    })(req, res)
};

const fail_login = (req, res) => {
    res.render('index',{layout: 'error_template', err: true});
};

const register_get = (req, res) => {
    res.render('index', {title: 'Regristro', layout: 'register'});
};

const register_post = (req, res, next) => {
    Passport.authenticate('register', { session: false }, (err, user, info) => {
        if(err || !user){
          return res.status(400).render('index', {layout: 'error_template', err: false})
        }
        const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
        req.session.jwt = token
        return res.redirect(req.returnTo || '/user/profile')
    })(req, res, next)
};

const fail_register = (req, res) => {
    res.render('index',{layout: 'error_template'});
};

const logout = (req, res) => {
    res.clearCookie('session');
    req.session.destroy((err) =>{
        if(err)
            console.log(err);
        res.redirect('/');
    });
}

/* =========== EXPORT =========== */
module.exports = {
    home,
    products,
    chat,
    user_profile,
    user_cart,
    login_get,
    login_post,
    fail_login,
    register_get,
    register_post,
    fail_register,
    logout,
};
