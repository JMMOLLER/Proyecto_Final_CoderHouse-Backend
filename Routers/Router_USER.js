const express = require('express');
const multer = require('multer');
const Route = express.Router();
const { storage } = require('../utils/MulterStorage');
const upload = multer({ storage });
const controller = require('../Routers/Controllers/USER.controller');
const auth = require('../Routers/middleware-authentication/USER.auth');
Route.use(express.json());


/* ============ ROUTES ============ */
Route.get('/', controller.home);

Route.get('/products', controller.products);

Route.get('/chat', auth.isLogged, controller.chat);

/* USER */
Route.get('/user/profile', auth.isLogged, controller.user_profile);

Route.get('/user/cart', auth.isLogged, controller.user_cart);

/* LOGIN */
Route.get('/login', auth.isUnLogged, controller.login_get);

Route.post('/login', auth.isUnLogged, controller.login_post);

Route.get('/fail_login', controller.fail_login);

/* REGISTRO */
Route.get('/register', auth.isUnLogged, controller.register_get);

Route.post('/register', auth.isUnLogged, upload.single('avatar'), controller.register_post);

Route.get('/fail_register', controller.fail_register);

/* TEST */
Route.get('/test', (req, res) => {
    res.send('test GET route is working successfully!!');
});

Route.post('/test', (req, res) => {
    res.json({
        msg: 'test POST route is working successfully!!',
        body: req.body
    });
});

Route.get('/protected', auth.isLogged, (req, res) => {
    res.send('this route is protected')
})

Route.get('/auth', auth.isLogged, (req, res) => {
    res.json({
        msg: 'you are Authenticated',
        returnTo: req.returnTo,
        user: req.user,
        token: req.session.jwt
    });
});

/* LOGOUT */
Route.get('/logout', controller.logout);

module.exports = { Route };