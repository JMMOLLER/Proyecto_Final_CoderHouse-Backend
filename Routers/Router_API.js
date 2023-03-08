require('dotenv').config();
const API_USER = require('express').Router();
const API_AUTH = require('express').Router();
const API_CART = require('express').Router();
const API_PRODUCT = require('express').Router();
const controller = require('./Controllers/API.controller');
const auth = require('./auth/auth');
const multer = require('multer');
const { storage } = require('../utils/MulterStorage');
const upload = multer({ storage });

/* =========== ROUTES =========== */

/* ============== API CARRITO ============== */

API_CART.use(auth.validateAdmin)// Middleware para validar en todas las rutas que el usuario sea administrador

/* RUTA PARA MOSTRAR TODOS LOS CARRITOS */

API_CART.get('/all', controller.cart.allCarts);

/* RUTA PARA MOSTRAR UN CARRITO POR ID */

API_CART.get('/:id', controller.cart.byCartId);

/* RUTA PARA MOSTRAR LOS PRODUCTOS AGREGADOS EN UN CARRITO */

API_CART.get('/:id/productos', controller.cart.getCartProducts);

/* RUTA PARA CREAR UN CARRITO */

API_CART.post('/', auth.isLogged, controller.cart.createCart);

/* RUTA PARA AGREGAR UN ID DE PRODUCTO AL CARRITO POR ID */

API_CART.put('/add/producto/:prod', auth.isLogged, controller.cart.addProductOnCart);

/* RUTA PARA ELIMINAR UN CARRITO POR ID */

API_CART.delete('/:id', controller.cart.deleteCart);

/* RUTA PARA ELIMINAR EL PRODUCTO DE UN CARRITO */

API_CART.delete('/producto/all/:id_prod', auth.isLogged, controller.cart.deleteProductOnCart);

/* RUTA PARA ELIMINAR UNA CANTIDAD DE PRODUCTO DEL CARRITO */

API_CART.delete('/producto/:id_prod', auth.isLogged, controller.cart.decreaseQuantityOnCart);


/* ============== API PRODUCTOS ============== */


API_PRODUCT.use(auth.validateAdmin)// Middleware para validar en todas las rutas que el usuario sea administrador


/* RUTA PARA MOSTRAR TODOS LOS PRODUCTOS */

API_PRODUCT.get('/', controller.products.allProducts);

/* RUTA PARA MOSTRAR UN PRODUCTO POR ID */

API_PRODUCT.get('/:id', controller.products.byProductId);

/* RUTA PARA MOSTRAR TODOS LOS PRODUCTOS DE UNA CATEGORÍA */

API_PRODUCT.get('/category/:category', controller.products.byCategory);

/* RUTA PARA CREAR UN PRODUCTO */

API_PRODUCT.post('/', controller.products.createProduct);

/* RUTA PARA VALIDAR AUMENTO DE CANTIDAD DE UN PRODUCTO EN LA ORDEN */

API_PRODUCT.get('/stock/:product_id/:cant', auth.isLogged, controller.products.consultQuantityOnPorduct);

/* RUTA PARA ACTUALIZAR UN PRODUCTO */

API_PRODUCT.put('/:id', controller.products.updateProduct);

/* RUTA PARA ELIMINAR UN PRODUCTO */

API_PRODUCT.delete('/:id', controller.products.deleteProduct);


/* ============== API AUTH ============== */

API_AUTH.use(require('express').json());

/* RUTA PARA INICIAR SESIÓN */
API_AUTH.post('/login', auth.isUnlogged, controller.auth.login);

/* RUTA PARA REGISTRARSE */
API_AUTH.post('/register', auth.isUnlogged, upload.single('avatar'), controller.auth.register);

/* RUTA PARA CERRAR SESIÓN */
API_AUTH.post('/logout', auth.isLogged, controller.auth.logout);


/* ============== API USER ============== */

API_USER.use(auth.validateAdmin)// Middleware para validar en todas las rutas que el usuario sea administrador;

/* RUTA PARA MOSTRAR INFORMACIÓN DEL USUARIO AUTENTICADO */

API_USER.get('/', auth.isLogged, controller.user.userInfo);

/* RUTA PARA MOSTRAR TODOS LOS USUARIOS */

API_USER.get('/all', controller.user.allUsers);

/* RUTA PARA MOSTRAR UN USUARIO POR ID */

API_USER.get('/:id', controller.user.getUserByID);

/* RUTA PARA MOSTRAR TODOS LOS MENSAJES DE UN USUARIO POR SU EMAIL */

API_USER.get('/chat/:mail', controller.user.getChat);

/* RUTA PARA COMPLETAR EL REGISTRO DE UN USUARIO */

API_USER.post('/completeRegister', controller.user.completeRegister);

/* RUTA PARA PROCESAR LA COMPRA DE UN USUARIO */

API_USER.post('/buy', auth.isLogged, controller.user.userPurchase);

/* RUTA PARA ACTUALIZAR LA INFORMACIÓN UN USUARIO */
API_USER.put('/update', auth.isLogged, upload.single('avatar'), controller.user.user_update);

/* RUTA PARA ELIMINAR UN USUARIO */

API_USER.delete('/', auth.isLogged, controller.user.deleteUser);

module.exports = {
    API_CART,
    API_PRODUCT,
    API_AUTH,
    API_USER
}; 