const express = require('express');
const multer = require('multer');
const USER = express.Router();
const path = require('path');
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
USER.use(express.json());
USER.use(express.urlencoded({ extended: true }));


USER.get('/', function (req, res) {
    res.render('index', {title: 'Home', layout: 'index'});
})

USER.get('/login', function (req, res) {
    res.render('index', {title: 'Login', layout: 'login'});
});

USER.post('/login', function (req, res) {
    res.json(req.body);
});

USER.get('/register', function (req, res) {
    res.render('index', {title: 'Regristro', layout: 'register'});
});

USER.post('/register', upload.single('avatar'), function (req, res) {
    res.json(req.body);
});

USER.get('/test', function (req, res) {
    res.render('index', {title: 'Test', layout: 'test'});
});

USER.post('/test', function (req, res) {
    res.json(req.body);
});


module.exports = USER;