const Passport = require('passport');
const { BD_Productos } = require('../../DB/DAOs/Productos.dao');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.dao');
const { BD_Ordenes } = require('../../DB/DAOs/Ordenes.dao');
const jwt = require('jsonwebtoken');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local.dao');

/* =========== ROUTES =========== */
const home = async(req, res) => {
    Passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            res.render('index', { title: 'Home', layout: 'index' });
        }else {
            res.render('index', { title: 'Home', layout: 'index', user });
        }
    })(req, res);
};

const chat = async(req, res) => {
    res.render('index', { title: 'Chat', layout: 'chat', user: req.user });
};

const getChat = async(req, res) => {
    try{
        let userChat = await BD_Usuarios_Local.getByEmail(req.params.mail);
        if(userChat){
            res.render('index', { title: `Chat de ${userChat.name}`, layout: 'getChat', user: req.user, userChat })
        }else{
            userChat = {};
            userChat.avatar = '/uploads/default.png';
            userChat.name = 'Usuario Desconocido';
            res.render('index', { title: 'Chat No encontrado', layout: 'getChat', user: req.user, userChat })
        }
    }catch(e){
        console.log(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const products = async(req, res) => {
    try{
        Passport.authenticate('jwt', { session: false }, async(err, user, info) => {
            const products= await BD_Productos.getAll();
            if (err || !user) {
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
        console.log(e);
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
        console.log(e);
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
        console.log(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const get_user_orders = async(req, res) => {
    try{
        const orders = await BD_Ordenes.getAllByUser(req.user._id);
        if(orders.value){
            res.render('index', {title: 'Mis Pedidos', layout: 'user_orders', user: req.user, orders: orders.orders });
        }else{
            if(orders.status = 404){
                res.send('No se encontro el pedido');
            }else{
                res.redirect('/fatal_error?err='+orders.message)
            }
        }
    }catch(e){
        console.log(e);
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
                res.send('No se encontro el pedido');
            }else{
                res.redirect('/fatal_error?err='+order.message)
            }
        }
    }catch(e){
        console.log(e);
        res.redirect('/fatal_error?err='+e.message)
    }
};

const register_twitter = (req, res) => {
    try{
        Passport.authenticate('twitter',{ session: false }, (err, user, info) => {
            if (err) { return res.redirect('/fail_login'); }
            if (!user) { return res.redirect('/fail_login'); }
            if((user.email).indexOf('@twitter.com') > -1){
                return res.redirect('/completeRegister/'+user._id);//Verificar si el usuario tiene sus datos completos
            }
            const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
            req.session.jwt = token
            return res.redirect('/user/profile')
        })(req, res)
    }catch(e){
        console.log(e);
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
            const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
            req.session.jwt = token
            return res.redirect('/user/profile')
        })(req, res)
    }catch(e){
        console.log(e);
        res.redirect('/fatal_error?err='+e.message)
    }
}

const login_get = (req, res) => {
    res.render('index', {title: 'Login', layout: 'login'});
};    

const register_get = (req, res) => {
    res.render('index', {title: 'Regristro', layout: 'register'});
};

const fail_login = (req, res) => {
    res.render('index',{ layout: 'error_template', isLoginError: true, msg: req.query.err || 'Unknow Login Error' });
};

const fail_register = (req, res) => {
    res.render('index',{ layout: 'error_template', isLoginError: false, msg: req.query.err || 'Unknow Register Error' });
};

const fatal_error = (req, res) => {
    res.render('index',{ layout: 'error_template', isfatalError: true, msg: req.query.err || 'Unknow Fatal Error' });
};

const completeRegister = (req, res) => {
    res.render('index', { title: 'Completar Registro', layout: 'completeRegister' });
};

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
};
