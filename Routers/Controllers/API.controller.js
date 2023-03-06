const { sendMessages, validatePhoneE164 } = require('../Services/API.service');
const { deleteUserImg } = require('../Services/API.service');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.daos.js');
const { BD_Productos } = require('../../DB/DAOs/Productos.daos.js');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local');
const Passport = require('passport');
const jwt = require('jsonwebtoken');
const errJSON = (e) => {
    if(!e){
        e = "ERROR - An error has occurred while processing the request"
    }return {
        status: 500,
        msg: "ERROR - " + e,
        value: false,
        returnTo: "/fatal_error"
    }
}
/* =========== ROUTES =========== */

/* API CARRITO */
const allCarts = async(req, res) => {
    try{
        const carts = await BD_Carrito.getAll();
        carts
            ? res.status(200).json({status: 200,msg: "OK",value: true,carts})
            : res.status(500).json(errJSON());
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const byCartId = async(req, res) => {
    try{
        const cart = await BD_Carrito.getById(req.params.id);
        cart
            ? res.status(200).json({status: 200, msg: "OK", value: true, cart})
            : res.status(404).json({
                status: 404,
                msg: "ERROR - Cart ID not found",
                value: true
            });
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const addProductOnCart = async(req, res) => {
    try{
        const id_carrito = await BD_Carrito.getCartByUserID(req.user._id)
        const id_producto = req.params.prod;
        const response = await BD_Carrito.addProduct({id_carrito: id_carrito._id, id_producto});
        response.value
            ? res.status(200).json({ status: 200, value: true, msg: 'OK', cart: response.content })
            : res.status(response.status).json({
                status: response.status,
                value: false,
                msg: `ERROR - ${response.message}`
            });
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const getCartProducts = async(req, res) => {
    try {
        const cart = await BD_Carrito.getById(req.params.id);
        if(cart){
            const datos = cart.productos;
            const productos = []
            for(let i = 0; i < datos.length; i++){
                productos.push(await BD_Productos.getById(datos[i].id));
                productos[i].quantity = datos[i].quantity;
            }
            res.status(200).json({status: 200,msg: "OK",value: true,productos});
        }else{
            res.status(404).json({
                status: 404,
                msg: "ERROR - cart ID not found",
                value: false
            })
        }
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const createCart = async(req, res) => {
    try{
        const cart = await BD_Carrito.createCarrito({ ownerId:req.user._id });
        cart
            ? res.status(201).json({status: 201, msg: 'CREATED', value: true, cart})
            : res.status(500).json({
                status: 500,
                msg: 'ERROR - while creating carrito',
                value: false
            })
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const decreaseQuantityOnCart = async(req, res) => {
    try{
        const response = await BD_Carrito.decreaseProduct(req.user._id, req.params.id_prod);
        response.value
            ? res.status(200).json({status: 200, msg: 'OK', value: true, cart: response.cart})
            : res.status(response.status).json({
                status: response.status, 
                msg: `ERR - ${response.message}`,
                value: false
            });
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const deleteProductOnCart = async(req, res) => {
    try{
        const response = await BD_Carrito.deleteProduct(req.user._id, req.params.id_prod);
        response.value
            ? res.status(200).json({status:200, msg: 'OK', value: true, cart: response.cart})
            : res.status(response.status).json({
                status: response.status,
                msg: `ERR - ${response.message}`,
                value: false
            })
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const deleteCart = async(req, res) => {
    try{
        const cart = await BD_Carrito.deleteByID(req.params.id);
        cart
            ? res.status(200).json({status: 200, msg: 'OK', value: true, cart})
            : res.status(404).json({
                status: 404,
                msg: 'ERROR - Cart ID not found',
                value: false
            })
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

/* API PRODUCTOS */



const allProducts = async(req, res) => {
    try{
        const products = await BD_Productos.getAll();
        products
            ? res.status(200).json({status: 200, msg: 'OK', value: true, products})
            : res.status(500).json(errJSON());
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
}

const byProductId = async(req, res) => {
    try{
        const product = await BD_Productos.getById(req.params.id);
        product
            ? res.status(200).json({status: 200, msg: 'OK', value: true, product})
            : res.status(404).json({
                status: 404, 
                msg: 'ERROR - Product ID not found',
                value: false
            })
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
}

const createProduct = async (req, res) => {
    try{
        if(BD_Productos.validateProduct(req.body)){
            const product = await BD_Productos.setProduct(req.body);
            product
                ? res.status(201).json({status: 201, msg: 'CREATED', value: true, product})
                : res.status(500).json(errJSON('ERROR - Se generó un error mientras se añadia el producto'))
        } else {
            res.status(400).json({
                status: 400,
                msg: 'ERROR - invalid JSON structure',
                value: false
            });
        }
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
}

const consultQuantityOnPorduct = async(req, res) => {
    try{
        if(!parseInt(req.params.cant) && req.params.cant != "++"){
            return res.status(400).json({status:400, msg: "ERROR - invalid quantity to consult", value: false});
        }
        if(req.params.cant < 1){
            return res.status(400).json({status:400, msg: "ERROR - invalid quantity to consult", value: false});
        }
        const data = req.params;//{product_id, cant}
        data.user_cart = await BD_Carrito.getCartByUserID(req.user._id);
        const response = await BD_Productos.checkStock(data)
        response.value
            ? res.status(200).json({status: 200, msg: 'OK', value: true})
            : res.status(response.status).json({ 
                status: response.status, 
                mg: `ERROR - ${response.message}`, 
                value: false
            })
        return;
    }catch(e){
        console.log(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const updateProduct = async(req, res) => {
    try{
        if(BD_Productos.validateProduct(req.body)){
            const product = await BD_Productos.updateProduct(req.body, req.params.id)
            product
                ? res.status(200).json({status: 200, msg: 'OK', value: true, product})
                : res.status(404).json({
                    status: 404,
                    msg: 'ERROR - Product ID not found',
                    value: false
                })
        }else{
            res.status(400).json({
                status: 400,
                msg: 'ERROR - invalid JSON structure',
                value: false
            })
        }
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
}

const deleteProduct = async(req, res) => {
    try{
        const product = await BD_Productos.deleteByID(req.params.id);
        product
            ? res.status(200).json({status: 200, msg: "OK", value: true, product})
            : res.status(404).json({
                status: 404,
                msg: "ERROR - Product ID not found",
                value: false
            });
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
}


/* API AUTH */

const login = async(req, res) => {
    Passport.authenticate('login', { session: false }, (err, user, info) => {
        if(err){
            return res.status(500).json({
                status: 500,
                msg: `ERROR - ${err.message}`,
                value: false
            })
        }
        if(!user){
            if(info.message === 'Contraseña invalida'){
                return res.status(401).json({
                    status: 401,
                    msg: `ERROR - ${info.message}`,
                    value: false,
                    returnTo: '/fail_login'
                })
            }else{
                return res.status(404).json({
                    status: 404,
                    msg: `ERROR - ${info.message}`,
                    value: false,
                    returnTo: '/fail_login'
                })
            }
        }
        const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
        req.session.jwt = token
        return res.status(202).json({
            status: 202,
            msg: 'ACEPTED',
            value: true,
            returnTo: req.returnTo || '/products'
        })
    })(req, res)
}

const register = async(req, res) => {
    Passport.authenticate('register', { session: false }, (err, user, info) => {
        if(err){
            return res.status(500).json({
                status: 500,
                msg: `ERROR - ${err.message}`,
                value: false
            })
        }
        if(!user){
            return res.status(409).json({
                status: 409,
                msg: `ERROR - ${info.message}`,
                value: false,
                returnTo: '/fail_register'
            })
        }
        const token = jwt.sign({ user }, process.env.COOKIE_SECRET)
        req.session.jwt = token
        return res.status(201).json({
            status: 201,
            msg: 'CREATED',
            value: true,
            returnTo: req.returnTo || '/products'
        })
    })(req, res)
}

const logout = async(req, res) => {
    res.clearCookie('session');
    return req.session.destroy((err) =>{
        if(err){
            return res.status(500).json({
                status: 500,
                msg: `ERROR - ${err.message}`,
                value: false,
                returnTo: '/'
            });
        }
        return res.status(200).json({
            status: 200,
            msg: 'OK',
            value: true,
            returnTo: '/'
        });
    });
}


/* API USER */


const allUsers = async(req, res) => {
    try{
        const users = await BD_Usuarios_Local.getAll();
        users
            ? res.status(200).json({status: 200, msg: 'OK', value: true, users})
            : res.status(500).json(errJSON());
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
}

const userInfo = (req, res) => {
    return res.status(200).json({
        status: 200,
        msg: 'OK',
        value: true,
        user: req.user
    });
};

const Info = async(req, res) => {
    try{
        const user = await BD_Usuarios_Local.getById(req.params.id)
        user
            ? res.status(200).json({status:200,msg:'OK',value: true,user})
            : res.status(404).json({
                status: 404,
                msg: 'ERROR - User ID not found',
                value: false
            });
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
};

const userPurchase = async(req, res) => {
    try{
        const cartInfo = await BD_Carrito.getCartByUserID(req.user._id);
        const userInfo = await BD_Usuarios_Local.getById(req.user._id);
        const values = [0, 5, 10]

        if(!values.includes(parseInt(req.body.shipping))){
            return res.status(400).json({
                status: 400,
                msg: "ERROR - Invalid shipping value",
                value: false
            });
        }else{
            cartInfo.shipping = req.body.shipping;
        }

        if(cartInfo.productos.length==0){

            return res.status(406).json({
                status: 406,
                msg: "ERROR - There are no products in the cart",
                value: false
            });

        }else if(await BD_Carrito.deleteByID(cartInfo._id)){

            await sendMessages({userInfo, cartInfo});
            return res.status(200).json({status: 200, msg: "OK", value: true})

        }else{
            return res.status(500).json(errJSON());
        }
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
};

const user_update = async(req, res) => {
    try{
        let oldAvatar, data = {};
        const {age, address, phone_number}= req.body;

        if(!validatePhoneE164(phone_number)){ return res.status(400).json({status: 400, msg: "ERROR - Invalid Phone Number", value: false}) };

        if(req.file){
            data.avatar = "/uploads/"+req.file.filename
            oldAvatar = await BD_Usuarios_Local.getAvatar(req.user._id)
        }else if(!age, !address, !phone_number){
            return res.status(400).json({status: 400, msg: "ERROR - Nothing to Update", value: false});
        }else{
            data.age = age;
            data.address = address;
            data.phone_number = phone_number;
        }
        
        if(await BD_Usuarios_Local.updateUser(req.user._id, data)){

            if(oldAvatar) {await deleteUserImg(oldAvatar)};
            
            const user = await BD_Usuarios_Local.getById(req.user._id);

            req.session.jwt = jwt.sign({ user }, process.env.COOKIE_SECRET);

            res.status(200).json({status: 200, msg: "OK", value: true})

        }else{
            res.status(500).json({status: 500, msg: "ERROR", value: false});
        }
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
};

const deleteUser = async(req, res) => {
    try{
        const avatar = await BD_Usuarios_Local.getAvatar(req.user._id);
        await deleteUserImg(avatar);
        const user = await BD_Usuarios_Local.deleteByID(req.user._id);
        user
            ? res.status(200).json({status: 200, msg: "OK", value: true, user})
            : res.status(500).json({
                status: 500, 
                msg: "ERROR - User ID not found", 
                value: false
            });
        req.session.destroy((err)=>{
            if(err){
                console.log(err);
            }
        });
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
};


/* =========== EXPORT =========== */
module.exports = {
    cart: {
        allCarts,
        byCartId,
        getCartProducts,
        createCart,
        addProductOnCart,
        deleteCart,
        decreaseQuantityOnCart,
        deleteProductOnCart
    },
    products: {
        allProducts,
        byProductId,
        createProduct,
        consultQuantityOnPorduct,
        updateProduct,
        deleteProduct,
    },
    auth:{
        login,
        register,
        logout,
    },
    user: {
        allUsers,
        userPurchase,
        deleteUser,
        user_update,
        userInfo,
        Info,
    }
};