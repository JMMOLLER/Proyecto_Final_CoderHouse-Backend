const API_Carrito = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./middleware-authentication/API.auth');

/* ============ API CARRITO ============= */

/* MÉTODO PARA MOSTRAR TODOS LOS CARRITOS */

API_Carrito.get('/all', controller.cart.allCarts);

/* MÉTODO PARA MOSTRAR UN CARRITO POR ID */

API_Carrito.get('/:id', controller.cart.byCartId);

/* MÉTODO PARA MOSTRAR LOS PRODUCTOS AGREGADOS EN UN CARRITO */

API_Carrito.get('/:id/productos', controller.cart.getCartProducts);

/* MÉTODO PARA CREAR UN CARRITO */

API_Carrito.post('/', auth.isLogged, controller.cart.createCart);

/* MÉTODO PARA AGREGAR UN ID DE PRODUCTO AL CARRITO POR ID */

API_Carrito.post('/producto/:id2', auth.isLogged, controller.cart.addProductOnCart);

/* MÉTODO PARA ELIMINAR UN CARRITO POR ID */

API_Carrito.delete('/api/carrito/:id', controller.cart.deleteCart);

/* MÉTODO PARA ELIMINAR UN PRODUCTO DEL CARRITO */

API_Carrito.delete('/api/carrito/:id/producto/:id_prod', controller.cart.deleteProductOnCart);

module.exports = { API_Carrito };