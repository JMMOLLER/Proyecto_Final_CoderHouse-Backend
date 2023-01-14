require('dotenv').config();
const API_USER = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./middleware-authentication/API.auth');


API_USER.get('/login', controller.user.checkLogin);

API_USER.post('/buy', auth.isLogged, controller.user.buy);

API_USER.delete('/', auth.isLogged, controller.user.deleteUser);

module.exports = { API_USER }; 