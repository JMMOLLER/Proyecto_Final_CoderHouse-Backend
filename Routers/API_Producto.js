const API_Producto = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./middleware-authentication/API.auth');

/* API PRODUCTOS */

API_Producto.get('/', controller.products.allProducts);

API_Producto.get('/:id', auth.validateAdmin, controller.products.byProductId);

API_Producto.post('/', auth.validateAdmin, controller.products.createProduct);

API_Producto.put('/:id', auth.validateAdmin, controller.products.updateProduct);

API_Producto.delete('/:id', auth.validateAdmin, controller.products.deleteProduct);

module.exports = { API_Producto };