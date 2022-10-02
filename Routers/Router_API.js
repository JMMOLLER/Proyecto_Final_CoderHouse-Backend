const express = require('express');
const path = require('path');
const API = express.Router();
const BaseDir = path.join(__dirname, '../');
const {Productos} = require('../API/API_Manager');
const BD_Productos = new Productos();

function validateAdmin(req, res, next) {
    if(String((req.query.admin)).toLowerCase() == "true"){
        next();
    }else{
        res.json({
            error: -1,
            descripción: {ruta: req.url,
                método: req.method,
            },
            estado: 'No autorizado'
        });
    }
}

API.get('/api/productos/', (req, res) => {
    res.json(BD_Productos.getAll());
});

API.get('/api/productos/:id', validateAdmin, (req, res) => {
    res.json(BD_Productos.getById(parseInt(req.params.id)));
});

API.post('/api/productos', validateAdmin, (req, res) => {
    if(BD_Productos.validateProduct(req.body)){
        BD_Productos.setProduct(req.body)
            ? res.json({status: 'OK'})
            : res.json({status: 'ERROR - an error was encountered while inserting the product'})
    }else{
        res.json({status: 'ERROR - invalid JSON structure'})
    }
});

API.put('/api/productos/:id', validateAdmin, (req, res) => {
    if(BD_Productos.validateProduct(req.body)){
        BD_Productos.updateProduct(req.body, parseInt(req.params.id))
            ? res.json({status: 'OK'})
            : res.json({status: 'ERROR - an error was encountered while inserting the product'})
    }else{
        res.json({status: 'ERROR - invalid JSON structure'})
    }
});

API.delete('/api/productos/:id', validateAdmin, (req, res) => {
    if(BD_Productos.deleteByID(parseInt(req.params.id))){
        res.json({status: "OK"});
    }else{
        res.json({status: "ERROR - ID not exists"});
    }
});

module.exports = API;