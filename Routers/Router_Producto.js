const express = require('express');
const path = require('path');
const API_Producto = express.Router();
const BaseDir = path.join(__dirname, '../');
const { BD_Productos } = require('../DB/DAOs/Productos.daos.js');
let isLoggedIn = false;

/**
 * If the query parameter "admin" is true, or if the user is logged in, then the user is allowed to
 * continue. Otherwise, the user is not allowed to continue.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - A function to be called to invoke the next middleware function in the stack.
 */
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

API_Producto.get('/api/productos/', async(req, res) => {
    res.json(await BD_Productos.getAll());
});

API_Producto.get('/api/productos/:id', validateAdmin, async(req, res) => {
    console.log(req.params.id);
    const producto = await BD_Productos.getById(req.params.id);
    typeof producto != 'boolean'
        ? res.json(producto)
        : res.json({status: 'ERROR - ID Product not exists'})
});

API_Producto.post('/api/productos', validateAdmin, async (req, res) => {
    console.log(req.body);
    if(BD_Productos.validateProduct(req.body)){
        const status = await BD_Productos.setProduct(req.body);
        !status
            ? res.json({status: 'ERROR - Se generó un error mientras se añadia el producto'})
            : res.json({status: 'OK'});
    } else {
        res.json({status: 'ERROR - invalid JSON structure'});
    }
});

API_Producto.put('/api/productos/:id', validateAdmin, async(req, res) => {
    console.log(req.params.id);
    if(BD_Productos.validateProduct(req.body)){
        await BD_Productos.updateProduct(req.body, req.params.id)
            ? res.json({status: 'OK'})
            : res.json({status: 'ERROR - ID_producto not exists'})
    }else{
        res.json({status: 'ERROR - invalid JSON structure'})
    }
});

API_Producto.delete('/api/productos/:id', validateAdmin, async(req, res) => {
    console.log(req.params.id);
    if(await BD_Productos.deleteByID(req.params.id)){
        res.json({status: "OK"});
    }else{
        res.json({status: "ERROR - ID not exists"});
    }
});

module.exports = API_Producto;