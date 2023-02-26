require('dotenv').config();
const API_USER = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./middleware-authentication/API.auth');
const multer = require('multer');
const { storage } = require('../utils/MulterStorage');
const upload = multer({ storage });


API_USER.get('/', auth.isLogged, controller.user.userInfo);

API_USER.get('/:id', controller.user.Info);

API_USER.post('/buy', auth.isLogged, controller.user.buy);

API_USER.put('/update', auth.isLogged, upload.single('avatar'), controller.user.user_update);

API_USER.delete('/', auth.isLogged, controller.user.deleteUser);

module.exports = { API_USER }; 