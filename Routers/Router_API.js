require('dotenv').config();
const API_USER = require('express').Router();
const API_Carrito = require('express').Router();
const API_Producto = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./auth/auth');
const multer = require('multer');
const { storage } = require('../utils/MulterStorage');
const upload = multer({ storage });

/* =========== ROUTES =========== */

/* API CARRITO */

API_Carrito.use(auth.validateAdmin)// Middleware para validar en todas las rutas que el usuario sea administrador

/* MÉTODO PARA MOSTRAR TODOS LOS CARRITOS */

API_Carrito.get('/all', controller.cart.allCarts);

/* MÉTODO PARA MOSTRAR UN CARRITO POR ID */

API_Carrito.get('/:id', controller.cart.byCartId);

/* MÉTODO PARA MOSTRAR LOS PRODUCTOS AGREGADOS EN UN CARRITO */

API_Carrito.get('/:id/productos', controller.cart.getCartProducts);

/* MÉTODO PARA VALIDAR APROBACIÓN DE AUMENTO DE CANTIDAD DE PEDIDO DE UN PRODUCTO */

API_Carrito.get('/stock/producto/:product_id/:cant', auth.isLogged, controller.cart.consultQuantityOnPorduct);

/* MÉTODO PARA CREAR UN CARRITO */

API_Carrito.post('/', auth.isLogged, controller.cart.createCart);

/* MÉTODO PARA AGREGAR UN ID DE PRODUCTO AL CARRITO POR ID */

API_Carrito.put('/add/producto/:prod', auth.isLogged, controller.cart.addProductOnCart);

/* MÉTODO PARA ELIMINAR UN CARRITO POR ID */

API_Carrito.delete('/:id', controller.cart.deleteCart);

/* MÉTODO PARA ELIMINAR EL PRODUCTO DE UN CARRITO */

API_Carrito.delete('/producto/all/:id_prod', auth.isLogged, controller.cart.deleteProductOnCart);

/* MÉTODO PARA ELIMINAR UNA CANTIDAD DE PRODUCTO DEL CARRITO */

API_Carrito.delete('/producto/:id_prod', auth.isLogged, controller.cart.decreaseQuantityOnCart);


/* API PRODUCTOS */


API_Producto.use(auth.validateAdmin)// Middleware para validar en todas las rutas que el usuario sea administrador

API_Producto.get('/', controller.products.allProducts);

API_Producto.get('/:id', controller.products.byProductId);

API_Producto.post('/', controller.products.createProduct);

API_Producto.put('/:id', controller.products.updateProduct);

API_Producto.delete('/:id', controller.products.deleteProduct);


/* API USER */

API_USER.get('/', auth.isLogged, controller.user.userInfo);

API_USER.get('/all', controller.user.allUsers);

API_USER.get('/:id', controller.user.Info);

API_USER.post('/buy', auth.isLogged, controller.user.userPurchase);

API_USER.put('/update', auth.isLogged, upload.single('avatar'), controller.user.user_update);

API_USER.delete('/', auth.isLogged, controller.user.deleteUser);

module.exports = {
    API_Carrito,
    API_Producto,
    API_USER
}; 