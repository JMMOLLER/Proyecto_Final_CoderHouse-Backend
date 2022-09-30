const express = require('express');
const path = require('path');
const API = express.Router();
const BaseDir = path.join(__dirname, '../');
const {Productos} = require('../API/API_Manager');
const BD_Productos = new Productos();

API.get('/api/productos/', (req, res) => {
    res.json(BD_Productos.getAll());
});

API.get('/api/productos/:id?', (req, res) => {
    if((req.url).indexOf('?')!=-1){
        let url = ((req.url).slice((req.url).indexOf('?')+1)).replace('=','":');
        url = JSON.parse('{'+'"'+url+'}')
        console.log(url);
        if(url.admin){
            res.json(BD_Productos.getById(parseInt(req.params.id)));
        }
    }
    res.json({
        error: -1,
        descripción: {ruta: req.url,
            método: req.method,
        },
        estado: 'No autorizado'
    });
});

API.post('/api/productos', (req, res) => {
    if((req.url).indexOf('?')!=-1){
        let url = ((req.url).slice((req.url).indexOf('?')+1)).replace('=','":');
        console.log(url);
        res.json({status: 'OK'});
    }else{
        res.json({status: 'ERR'})
    }
    
})

module.exports = API;