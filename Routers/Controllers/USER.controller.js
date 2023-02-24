const Passport = require('passport');
const { BD_Productos } = require('../../DB/DAOs/Productos.daos');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.daos');

/* =========== ROUTES =========== */
const home = async(req, res) => {
    if (req.isAuthenticated()) {
        res.render('index', {title: 'Home', layout: 'index', user: req.isAuthenticated(), avatar: req.session.passport.user.avatar});
    }else {
        res.render('index', {title: 'Home', layout: 'index', user: req.isAuthenticated()});
    }
};

const chat = async(req, res) => {
    res.render('index', {title: 'Chat', layout: 'chat', user: req.isAuthenticated(), avatar: req.session.passport.user.avatar});
};

const products = async(req, res) => {
    const products= await BD_Productos.getAll();
    if (req.isAuthenticated()) {
        res.render('index', {
            title: 'Productos',
            layout: 'products',
            products: products,
            user: req.isAuthenticated(),
            avatar: req.session.passport.user.avatar
        });
    }else {
        res.render('index', {
            title: 'Productos', 
            layout: 'products', 
            products: products, 
            user: req.isAuthenticated()
        });
    }
};

const user_profile = async(req, res) => {
    const user = await BD_Usuarios_Local.getById(req.session.passport.user.id);
    res.render('index', {
        title: 'Perfil', 
        layout: 'user_profile', 
        user: req.isAuthenticated(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        age: user.age,
        address: user.address,
        phone_number: user.phone_number,
    });
};

const user_cart = async(req, res) => {
    try {
        const cart = await BD_Carrito.getCartByUserID(req.session.passport.user.id);
        const products = await BD_Carrito.getInfoProducts(cart.productos);
        let total = 0
        products.forEach(product => {
            total += product.price * product.quantity;
        });
        res.render('index', {
            title: 'Carrito', 
            layout: 'user_cart', 
            user: req.isAuthenticated(), 
            products: products,
            cant: products.length,
            total: total.toFixed(2),
            avatar: req.session.passport.user.avatar,
        });
    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m',error);
        res.render('index', { 
            title: 'Carrito', 
            layout: 'user_cart',
            user: req.isAuthenticated(),
            avatar: req.session.passport.user.avatar
        });
    }
};

const login_get = (req, res) => {
    res.render('index', {title: 'Login', layout: 'login'});
};

const login_post = (req, res) => {
    res.redirect(req.session.passport.user.returnTo || '/user/profile');
};

const fail_login = (req, res) => {
    res.render('index',{layout: 'error_template', err: true});
};

const register_get = (req, res) => {
    res.render('index', {title: 'Regristro', layout: 'register'});
};

const register_post = Passport.authenticate('signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/fail_register',
});

const fail_register = (req, res) => {
    res.render('index',{layout: 'error_template'});
};

const logout = (req, res) => {
    res.clearCookie('session');
    req.session.destroy((err) =>{
        if(err)
            console.log(err);
        res.redirect('/');
    });
}

/* =========== EXPORT =========== */
module.exports = {
    home,
    products,
    chat,
    user_profile,
    user_cart,
    login_get,
    login_post,
    fail_login,
    register_get,
    register_post,
    fail_register,
    logout,
};
