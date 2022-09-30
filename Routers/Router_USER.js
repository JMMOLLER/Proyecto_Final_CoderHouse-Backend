const express = require('express');
const USER = express.Router();
const path = require('path');
const BaseDir = path.join(__dirname, '../');

USER.get('/', function (req, res) {
    res.sendFile(BaseDir+'/public/html/index.html');
})

module.exports = USER;