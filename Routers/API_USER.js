require('dotenv').config();
const API_USER = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./middleware-authentication/API.auth');


API_USER.get('/login', controller.user.checkLogin);

API_USER.post('/buy', auth.isLogged, controller.user.buy);

module.exports = { API_USER }; 