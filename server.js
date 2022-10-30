const express = require('express');
const app = express();
const API_Carrito = express.Router(),
API_Producto = express.Router();
const PORT = 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(require('./Routers/Router_Carrito'));
app.use(require('./Routers/Router_Producto'));
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
    console.log("Servidor iniciado en: http://localhost:"+PORT);
});

server.on('error', (e) => console.log("Se ha generado un error: " + e));

app.use('/api/carrito', API_Carrito)
app.use('/api/productos', API_Producto)
app.use((req, res) =>{
    res.status(404).send({error: -2, description: {route: req.url, method: req.method}, status: 'Route not found'});
});

