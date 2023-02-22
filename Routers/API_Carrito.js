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

/* MÉTODO PARA VALIDAR APROBACIÓN DE AUMENTO DE CANTIDAD DE PEDIDO DE UN PRODUCTO */

API_Carrito.get('/stock/producto/:id/:cant', auth.isLogged, controller.cart.consultQuantityOnPorduct);

/* MÉTODO PARA CREAR UN CARRITO */

API_Carrito.post('/', auth.isLogged, controller.cart.createCart);

/* MÉTODO PARA AGREGAR UN ID DE PRODUCTO AL CARRITO POR ID */

API_Carrito.put('/add/producto/:prod', auth.isLogged, controller.cart.addProductOnCart);

/* MÉTODO PARA ELIMINAR UN CARRITO POR ID */

API_Carrito.delete(':id', controller.cart.deleteCart);

/* MÉTODO PARA ELIMINAR EL PRODUCTO DE UN CARRITO */

API_Carrito.delete('/producto/all/:id_prod', controller.cart.deleteProductOnCart);

/* MÉTODO PARA ELIMINAR UNA CANTIDAD DE PRODUCTO DEL CARRITO */

API_Carrito.delete('/producto/:id_prod', controller.cart.decreaseQuantityOnCart);

module.exports = { API_Carrito };