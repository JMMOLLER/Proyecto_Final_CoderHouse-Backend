const express = require('express');
const multer = require('multer');
const { BD_Autores_Local } = require('../DB/DAOs/Usuarios_Local');
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

/* ============ ROUTES ============ */
USER.get('/', function (req, res) {
    res.render('index', {title: 'Home', layout: 'index'});
})

/* LOGIN */
USER.get('/login', function (req, res) {
    res.render('index', {title: 'Login', layout: 'login'});
});

USER.post('/login', function (req, res) {
    res.json(req.body);
});

/* REGISTRO */
USER.get('/register', function (req, res) {
    res.render('index', {title: 'Regristro', layout: 'register'});
});

USER.post('/register', upload.single('avatar'), async function (req, res) {
    const data = req.body;
    if(data.avatar_type!="0")
        data.avatar = req.file.filename;
    delete data.avatar_type;
    await BD_Autores_Local.createAuthor(data)
        ? res.json("OK")
        : res.json("ERROR");
});

/* TEST */
USER.get('/test', function (req, res) {
    res.render('index', {title: 'Test', layout: 'test'});
});

USER.post('/test', function (req, res) {
    res.json(req.body);
});


module.exports = USER;