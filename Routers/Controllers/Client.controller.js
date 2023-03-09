const Passport = require('passport');
const logger = require('../../utils/LoggerConfig');
const { generateToken, info_data } = require('../Services/API.service');
/* =========== DAOs =========== */
const { BD_Productos } = require('../../DB/DAOs/Productos.dao');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.dao');
const { BD_Ordenes } = require('../../DB/DAOs/Ordenes.dao');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local.dao');
/* =========== END DAOs =========== */



/* =========== ROUTES =========== */
const home = async(req, res) => {
    try{
        Passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err || !user) {
                res.clearCookie('session');
                res.render('index', { title: 'Home', layout: 'index' });
            }else {
                res.render('index', { title: 'Home', layout: 'index', user });
            }
        })(req, res);
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const sysInfo = (req, res) => {
    try{
        res.render('index', { title: 'Configuración del servidor', layout: 'sysInfo', data: info_data() });
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const chat = async(req, res) => {
    try{
        res.render('index', { title: 'Chat', layout: 'chat', user: req.user });
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const getChat = async(req, res) => {
    try{
        let userChat = await BD_Usuarios_Local.getByEmail(req.params.mail);
        if(userChat){
            res.render('index', { title: `Chat de ${userChat.name}`, layout: 'getChat', user: req.user, userChat })
        }else{
            logger.warn(`No se encontró el usuario con email: ${req.params.mail}`);
            userChat = {};
            userChat.avatar = '/uploads/default.png';
            userChat.name = 'Usuario Desconocido';
            res.render('index', { title: 'Chat No encontrado', layout: 'getChat', user: req.user, userChat })
        }
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const products = async(req, res) => {
    try{
        Passport.authenticate('jwt', { session: false }, async(err, user, info) => {
            const products= await BD_Productos.getAll();
            if(err) throw err;
            if (!user) {
                res.render('index', {
                    title: 'Productos', 
                    layout: 'products', 
                    products: products
                });
            }else {
                res.render('index', {
                    title: 'Productos',
                    layout: 'products',
                    products: products,
                    user
                });
            }
        })(req, res);
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const user_profile = async(req, res) => {
    try{
        res.render('index', {
            title: 'Perfil', 
            layout: 'user_profile', 
            user: req.user,
        });
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const user_cart = async(req, res) => {
    try {
        const cart = await BD_Carrito.getCartByUserID(req.user._id);
        const products = await BD_Carrito.getInfoProducts(cart.productos);
        let total = 0
        products.forEach(product => {
            total += product.price * product.quantity;
        });
        res.render('index', {
            title: 'Carrito', 
            layout: 'user_cart', 
            products: products,
            cant: products.length,
            total: total.toFixed(2),
            user: req.user
        });
    } catch (e) {
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const get_user_orders = async(req, res) => {
    try{
        const orders = await BD_Ordenes.getAllByUser(req.user._id);
        if(orders.value){
            res.render('index', {title: 'Mis Pedidos', layout: 'user_orders', user: req.user, orders: orders.orders });
        }else{
            res.redirect('/fatal_error?err='+orders.message)
        }
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const get_user_order = async(req, res) => {
    try{
        const order = await BD_Ordenes.getByCode(req.params.code);
        if(order.value){
            res.render('index', {title: 'Pedido #'+req.params.code, layout: 'user_order', user: req.user, order: order.order });
        }else{
            if(order.status = 404){
                res.render('index', {title: 'Pedido no encontrado', layout: 'notFound'})
            }else{
                res.redirect('/fatal_error?err='+order.message)
            }
        }
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

/* AUTH */

const register_twitter = (req, res) => {
    try{
        Passport.authenticate('twitter',{ session: false }, (err, user, info) => {

            if (err) { return res.redirect('/fail_login'); }

            if (!user) { return res.redirect('/fail_login'); }

            if((user.email).indexOf('@twitter.com') > -1){
                return res.redirect('/completeRegister/'+user._id);//Verificar si el usuario tiene sus datos completos
            }

            req.session.jwt = generateToken(user);

            return res.redirect('/user/profile')
        })(req, res)
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
}

const register_github = (req, res) => {
    try{
        Passport.authenticate('github',{ session: false }, (err, user, info) => {

            if (err) { return res.redirect('/fail_login'); }

            if (!user) { return res.redirect('/fail_login'); }
            
            if((user.email).indexOf('@github.com') > -1){
                return res.redirect('/completeRegister/'+user._id);//Verificar si el usuario tiene sus datos completos
            }

            req.session.jwt = generateToken(user);

            return res.redirect('/user/profile')
        })(req, res)
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
}

const login_get = (req, res) => {
    try{
        res.render('index', {title: 'Login', layout: 'login'});
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};    

const register_get = (req, res) => {
    try{
        res.render('index', {title: 'Regristro', layout: 'register'});
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const fail_login = (req, res) => {
    try{
        res.render('index',{ layout: 'error_template', isLoginError: true, msg: req.query.err || 'Unknow Login Error' });
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const fail_register = (req, res) => {
    try{
        res.render('index',{ layout: 'error_template', isLoginError: false, msg: req.query.err || 'Unknow Register Error' });
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const fatal_error = (req, res) => {
    try{
        res.render('index',{ layout: 'error_template', isfatalError: true, msg: req.query.err || 'Unknow Fatal Error' });
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const completeRegister = (req, res) => {
    try{
        res.render('index', { title: 'Completar Registro', layout: 'completeRegister' });
    }catch(e){
        logger.error(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

/* =========== END ROUTES =========== */

/* =========== EXPORT =========== */
module.exports = {
    home,
    products,
    chat,
    getChat,
    user_profile,
    user_cart,
    login_get,
    fail_login,
    register_get,
    fail_register,
    fatal_error,
    register_twitter,
    register_github,
    completeRegister,
    get_user_orders,
    get_user_order,
    sysInfo,
};
