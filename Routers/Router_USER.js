const express = require('express');
const multer = require('multer');
const Route = express.Router();
const Passport = require('passport');
const { storage } = require('../utils/MulterStorage');
const upload = multer({ storage });
const controller = require('../Routers/Controllers/USER.controller');
const auth = require('../Routers/middleware-authentication/USER.auth');
Route.use(express.json());


/* ============ ROUTES ============ */
Route.get('/', controller.home);

Route.get('/products', controller.products);

/* USER */
Route.get('/user/profile', auth.isLogged, controller.user_profile);

Route.get('/user/cart', auth.isLogged, controller.user_cart);

/* LOGIN */
Route.get('/login', auth.isUnlogged, controller.login_get);

Route.post('/login', auth.isUnlogged, controller.login_post);

Route.get('/fail_login', controller.fail_login);

/* REGISTRO */
Route.get('/register', auth.isUnlogged, controller.register_get);

Route.post('/register', auth.isUnlogged, upload.single('avatar'), controller.register_post);

Route.get('/fail_register', controller.fail_register);

/* TEST */
Route.get('/test', (req, res) => {
    res.render('index', {title: 'Test', layout: 'test'});
});

Route.post('/test', Passport.authenticate('jwt', {session: false}), (req, res) => {
    res.send(req.user);
});

/* LOGOUT */
Route.get('/logout', controller.logout);

module.exports = { Route };