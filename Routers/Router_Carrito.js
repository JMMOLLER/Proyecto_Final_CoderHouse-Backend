const express = require('express');
const API_Carrito = express.Router();
const { BD_Carrito } = require('../DAOs/Carrito.daos.js');
const { BD_Productos } = require('../DAOs/Productos.daos.js');



/* API CARRITO */

/* MÉTODO PARA MOSTRAR TODOS LOS CARRITOS */

API_Carrito.get('/api/carrito', async(req, res) => {
    res.send(await BD_Carrito.getAll());
});

/* MÉTODO PARA MOSTRAR UN CARRITO POR ID */

API_Carrito.get('/api/carrito/:id', async(req, res) => {
    const status = await BD_Carrito.getById(req.params.id);
    !status
        ? res.json({status: "ERROR - ID Carrito no existe"})
        : res.send(status);
});

/* MÉTODO PARA MOSTRAR LOS PRODUCTOS AGREGADOS EN UN CARRITO */

API_Carrito.get('/api/carrito/:id/productos', async(req, res) => {
    try {
        const status = await BD_Carrito.getById(req.params.id);
        if(status){
            console.log(status.productos);
            if(status.productos.length != 0){
                /* DEVUELVE UNA LISTA DE IDs Y CON LA CLASE PRODUCTOS VAMOS RETORNANDO LOS VALORES COMPLETOS */
                const datos = status.productos.map((id) => { return id });
                const productos = []
                for(let i = 0; i < datos.length; i++){
                    productos.push(await BD_Productos.getById(datos[i]));
                }
                res.json(productos);
            }else{
                res.json({productos: 'El carrito de este usuario esta vacío'})
            }
        }else{
            res.json({status: "ERROR - ID Carrito no existe"})
        }
    }catch(e){
        console.log(e);
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

/* MÉTODO PARA CREAR UN CARRITO */

API_Carrito.post('/api/carrito/', async(req, res) => {
    const new_carrito = await BD_Carrito.createCarrito();
    !new_carrito
        ? res.json({status: 'ERROR - while creating carrito'})
        : res.send(new_carrito)
});

/* MÉTODO PARA AGREGAR UN ID DE PRODUCTO AL CARRITO POR ID */

API_Carrito.post('/api/carrito/:id1/producto/:id2', async(req, res) => {
    try{
        const status = await BD_Carrito.setProduct(req.params.id1, req.params.id2);
        !status
            ? res.json({status: 'ERROR - ID Carrito no existe'})
            : res.json({status: 'OK'});
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

/* MÉTODO PARA ELIMINAR UN CARRITO POR ID */

API_Carrito.delete('/api/carrito/:id', async(req, res) => {
    try{
        const status = await BD_Carrito.deleteByID(req.params.id);
        !status
            ? res.json({status: 'ERROR - ID Carrito no existe'})
            : res.json({status: 'OK'});
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

/* MÉTODO PARA ELIMINAR UN PRODUCTO DEL CARRITO */

API_Carrito.delete('/api/carrito/:id/productos/:id_prod', async(req, res) => {
    try{
        const status = await BD_Carrito.deleteProduct(req.params.id, req.params.id_prod);
        status.length == 2
            ? res.json({status: 'ERROR - ID Carrito no existe'})
            : res.json({status: 'OK'});
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
});

module.exports = API_Carrito;