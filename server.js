const express = require('express');
const app = express();
const API = express.Router(),
USER = express.Router();
const PORT = 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(require('./Routers/Router_API'));
app.use(require('./Routers/Router_USER'));
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
    console.log("Servidor iniciado en: http://localhost:"+PORT);
});

server.on('error', (e) => console.log("Se ha generado un error: " + e));

app.use('/', USER)
app.use('/api', API)

