const express = require('express');
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars');

const app = express();
const PORT = 8080;
const API_Carrito = express.Router(),
API_Producto = express.Router(),
TEMPLATES = express.Router();

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
}));
app.use(express.json());
app.use(require('./Routers/Router_Carrito'));
app.use(require('./Routers/Router_Producto'));
app.use(require('./Routers/Router_USER'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
    console.log("Servidor iniciado en: http://localhost:"+PORT);
});

server.on('error', (e) => console.log("Se ha generado un error: " + e));

app.use('/api/carrito', API_Carrito);
app.use('/api/productos', API_Producto);
app.use('/', TEMPLATES);
app.use((req, res) =>{
    res.status(404).send({error: -2, description: {route: req.url, method: req.method}, status: 'Route not found'});
});

