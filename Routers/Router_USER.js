const express = require('express');
const USER_FRONT = express.Router();
const controller = require('./Controllers/Client.controller');
const auth = require('./auth/auth');
const jwt = require('jsonwebtoken');
const Passport = require('passport');
USER_FRONT.use(express.json());


/* ============ ROUTES ============ */
USER_FRONT.get('/', controller.home);

USER_FRONT.get('/products', controller.products);

USER_FRONT.get('/chat', auth.clientIsLogged, controller.chat);

USER_FRONT.get('/chat/:mail', auth.clientIsLogged, controller.getChat);

/* USER */
USER_FRONT.get('/user/profile', auth.clientIsLogged, controller.user_profile);

USER_FRONT.get('/user/cart', auth.clientIsLogged, controller.user_cart);

/* LOGIN */
USER_FRONT.get('/login', auth.clientIsUnLogged, controller.login_get);

USER_FRONT.get('/fail_login', controller.fail_login);

/* REGISTRO */
USER_FRONT.get('/register', auth.clientIsUnLogged, controller.register_get);

USER_FRONT.get('/fail_register', controller.fail_register);

USER_FRONT.get('/completeRegister/:userId', (req, res) => {
    res.render('index', { title: 'Completar Registro', layout: 'completeRegister' });
});

/* PASSPORT AUTHENTICATE */

USER_FRONT.get('/auth/twitter/login', controller.register_twitter);

USER_FRONT.get('/auth/twitter', Passport.authenticate('twitter'));

/* FATAL ERROR */
USER_FRONT.get('/fatal_error', controller.fatal_error);

/* TEST */
USER_FRONT.get('/test', (req, res) => {
    res.send('test GET route is working successfully!!');
});

USER_FRONT.post('/test', (req, res) => {
    res.json({
        msg: 'test POST route is working successfully!!',
        body: req.body
    });
});

USER_FRONT.get('/protected', auth.clientIsLogged, (req, res) => {
    res.send('this route is protected')
})


module.exports = { USER_FRONT };
