require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const MongoStore = require('connect-mongo');
const Passport = require('passport');

require('./DB/Passport_Strategies/Passport');
const { API_Carrito } = require('./Routers/API_Carrito');
const { API_Producto } = require('./Routers/API_Producto');
const { API_USER } = require('./Routers/API_USER');
const { Route } = require('./Routers/Router_USER');
const app = express();
const PORT = 8080;
const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 90*60
});

/* ============ MIDDLEWARES ============ */
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    name: 'session',
    store: sessionStore,
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 90*10000,
    }
}));
app.use(Passport.initialize());
app.use(Passport.session());
app.use(Passport.authenticate('session'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============ ROUTES ============ */
app.use('/api/carrito', API_Carrito);
app.use('/api/productos', API_Producto);
app.use('/api/user', API_USER);
app.use('/', Route);
app.use((req, res) =>{
    res.status(404).send({error: -2, description: {route: req.url, method: req.method}, status: 'Route not found'});
});

/* ============ SERVER ============ */
const server = app.listen(PORT, () => {
    console.log("Servidor iniciado en: http://localhost:"+PORT);
});

server.on('error', (e) => console.log("Se ha generado un error: " + e));