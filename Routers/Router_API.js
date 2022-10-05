const express = require('express');
const path = require('path');
const API = express.Router();
const BaseDir = path.join(__dirname, '../');
const {Productos, Carrito} = require('../API/API_Manager');
const BD_Productos = new Productos();
const BD_Carrito = new Carrito();
let isLoggedIn = false;

function validateAdmin(req, res, next) {
    if(String((req.query.admin)).toLowerCase() == "true" || isLoggedIn){
        isLoggedIn = true;
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

/* API PRODUCTOS */

API.get('/api/productos/', (req, res) => {
    res.json(BD_Productos.getAll());
});

API.get('/api/productos/:id', validateAdmin, (req, res) => {
    const producto = BD_Productos.getById(parseInt(req.params.id));
    typeof producto != 'boolean'
        ? res.json(producto)
        : res.json({status: 'ERROR - ID Product not exists'})
});

API.post('/api/productos', validateAdmin, (req, res) => {
    if(BD_Productos.validateProduct(req.body)){
        BD_Productos.setProduct(req.body)
            ? res.json({status: 'OK'})
            : res.json({status: 'ERROR - an error was encountered while inserting the product'})
    }else{
        res.json({status: 'ERROR - invalid JSON structure'});
    }
});

API.put('/api/productos/:id', validateAdmin, (req, res) => {
    if(BD_Productos.validateProduct(req.body)){
        const status = BD_Productos.updateProduct(req.body, parseInt(req.params.id))
        status.length == 1
            ? res.json({status: 'OK'})
            : res.json({status: 'ERROR - ID_producto not exists'})
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

/* API CARRITO */

API.get('/api/carrito/:id/productos', (req, res) => {
    try {
        const carrito = BD_Carrito.getById(parseInt(req.params.id));
        if(carrito.length == 1){
            if(carrito[0].productos.length != 0){
                /* DEVUELVE UNA LISTA DE IDs Y CON LA CLASE PRODUCTOS VAMOS RETORNANDO LOS VALORES COMPLETOS */
                const productos = carrito[0].productos.map((elemento) => {
                    return BD_Productos.getById(elemento);
                });
                res.json(productos);
            }else{
                res.json({productos: 'EMPTY'})
            }
        }else{
            carrito[1].message.includes('exists')
                    ? res.json({status: 'ERROR - '+carrito[1].message})
                    : res.json({status: 'ERROR - internal error'});
        }
    }catch(e){
        console.log(e);
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

API.post('/api/carrito/', (req, res) => {
    const new_carrito = BD_Carrito.createCarrito();
    typeof id != 'boolean'
        ? res.json({new_carrito_id: new_carrito})
        : res.json({status: 'ERROR - while creating carrito'})
});

API.post('/api/carrito/:id1/productos/:id2', (req, res) => {
    try{
        const status = BD_Carrito.setProduct(parseInt(req.params.id1), parseInt(req.params.id2));
        if(status.length == 1) {
            res.json({status: 'OK'});
        }else{
            status[1].message.includes('exists')
                ? res.json({status: 'ERROR - '+status[1].message})
                : res.json({status: 'ERROR - internal error'});
        }
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

API.delete('/api/carrito/:id', (req, res) => {
    try{
        const status = BD_Carrito.deleteByID(parseInt(req.params.id));
        if(status.length == 1) {
            res.json({status: 'OK'});
        }else{
            status[1].message.includes('exists')
                ? res.json({status: 'ERROR - '+status[1].message})
                : res.json({status: 'ERROR - internal error'});
        }
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

API.delete('/api/carrito/:id/productos/:id_prod', (req, res) => {
    try{
        const status = BD_Carrito.deleteProduct(parseInt(req.params.id), parseInt(req.params.id_prod))
        if(status.length == 1) {
            res.json({status: 'OK'});;
        }else{
            status[1].message.includes('exists')
                ? res.json({status: 'ERROR - '+status[1].message})
                : res.json({status: 'ERROR - internal error'});
        }
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

module.exports = API;