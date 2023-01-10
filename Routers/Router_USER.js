const express = require('express');
const multer = require('multer');
const Route = express.Router();
const path = require('path');
const Passport = require('passport');
const BaseDir = path.join(__dirname, '../');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, BaseDir + '/public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const { BD_Autores_Local } = require('../DB/DAOs/Usuarios_Local');
const { BD_Productos } = require('../DB/DAOs/Productos.daos');
const { BD_Carrito } = require('../DB/DAOs/Carrito.daos');
Route.use(express.json());

/* ============ FUNCTIONS ============ */

function isUnlogged(req, res, next) {
    if (req.isUnauthenticated())
        return next();
    res.redirect('/');
}

function isLogged(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

/* ============ ROUTES ============ */
Route.get('/', (req, res) => {
    res.render('index', {title: 'Home', layout: 'index', user: req.isAuthenticated()});
})

Route.get('/products', async(req, res) => {
    const products= await BD_Productos.getAll();
    res.render('index', {title: 'Productos', layout: 'products', products: products, user: req.isAuthenticated()});
});

/* USER */
Route.get('/user/profile', isLogged, async(req, res) => {
    const user = await BD_Autores_Local.getById(req.session.passport.user);
    res.render('index', {
        title: 'Perfil', 
        layout: 'user_profile', 
        user: req.isAuthenticated(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        age: user.age,
        address: user.address,
        phone_number: user.phone_number,
    });
});

Route.get('/user/cart', isLogged, async(req, res) => {
    const cart = await BD_Carrito.getCartByUserID(req.session.passport.user);
    const products = await BD_Carrito.getInfoProducts(cart.productos);
    let total = 0
    products.forEach(product => {
        total += product.price * product.quantity;
    });
    res.render('index', {
        title: 'Carrito', 
        layout: 'user_cart', 
        user: req.isAuthenticated(), 
        products: products,
        cant: products.length,
        total: total.toFixed(2)
    });
});

/* LOGIN */
Route.get('/login', isUnlogged, (req, res) => {
    res.render('index', {title: 'Login', layout: 'login'});
});

Route.post('/login', isUnlogged, Passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/fail_login',
}));

Route.get('/fail_login', (req, res) => {
    res.render('index',{layout: 'error_template', err: true});
});

/* REGISTRO */
Route.get('/register', isUnlogged, (req, res) => {
    res.render('index', {title: 'Regristro', layout: 'register'});
});

Route.post('/register', isUnlogged, upload.single('avatar'), Passport.authenticate('signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/fail_register',
}));

Route.get('/fail_register', (req, res) => {
    res.render('index',{layout: 'error_template'});
});

/* TEST */
Route.get('/test', (req, res) => {
    res.render('index', {title: 'Test', layout: 'test'});
});

Route.post('/test', (req, res) => {
    res.json(req.body);
});

/* LOGOUT */
Route.get('/logout', (req, res) => {
    res.clearCookie('session');
    req.session.destroy((err) =>{
        if(err)
            console.log(err);
        res.redirect('/');
    });
});

module.exports = { Route };