const express = require('express');
const API_USER = express.Router();

API_USER.get('/login', function (req, res) {
    res.json({status: req.isAuthenticated()});
});

module.exports = { API_USER }; 