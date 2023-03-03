const API_Producto = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./auth/auth');

/* API PRODUCTOS */

API_Producto.use(auth.validateAdmin)// Middleware para validar en todas las rutas que el usuario sea administrador

API_Producto.get('/', controller.products.allProducts);

API_Producto.get('/:id', controller.products.byProductId);

API_Producto.post('/', controller.products.createProduct);

API_Producto.put('/:id', controller.products.updateProduct);

API_Producto.delete('/:id', controller.products.deleteProduct);

module.exports = { API_Producto };