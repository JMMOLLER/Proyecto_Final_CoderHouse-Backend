/* =========== DAOs =========== */
const { BD_Carrito } = require('../../DB/DAOs/Carrito.dao.js');
const { BD_Productos } = require('../../DB/DAOs/Productos.dao.js');
const { BD_Ordenes } = require('../../DB/DAOs/Ordenes.dao.js');
const { Mensajes } = require('../../DB/DAOs/Mensajes.dao.js');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local.dao');
const BD_Mensajes = new Mensajes().returnSingleton();
/* =========== END DAOs =========== */
const { sendMessages, validatePhoneE164, sendEmail } = require('../Services/API.service');
const { deleteUserImg } = require('../Services/API.service');
const { generateToken } = require('../Services/API.service');
const Passport = require('passport');
const logger = require('../../utils/LoggerConfig');
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
        if(carts){
            res.status(200).json({status: 200,msg: "OK",value: true,carts})
        }else{
            logger.error("ERROR - No se pudo obtener los carritos")
            res.status(500).json(errJSON());
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const byCartId = async(req, res) => {
    try{
        const cart = await BD_Carrito.getById(req.params.id);
        if(cart){
            res.status(200).json({status: 200, msg: "OK", value: true, cart})
        }else{
            logger.warn(`ERROR - No se encontró el carrito con ID: ${req.params.id}`)
            res.status(404).json({
                status: 404,
                msg: "ERROR - Cart ID not found",
                value: true
            });
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const addProductOnCart = async(req, res) => {
    try{
        const id_carrito = await BD_Carrito.getCartByUserID(req.user._id)
        const id_producto = req.params.prod;
        const response = await BD_Carrito.addProduct({id_carrito: id_carrito._id, id_producto});

        if(response.value){
            res.status(200).json({ status: 200, value: true, msg: 'OK', cart: response.content })
        }else{

            if(response.status === 500){
                logger.error(response.message);
                return res.status(500).json(errJSON(response.message));
            }else{
                logger.warn(response.message);
                return res.status(response.status).json({
                    status: response.status,
                    value: false,
                    msg: `ERROR - ${response.message}`
                });
            }

        }
        return;
    }catch(e){
        logger.error(e);
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
            res.status(200).json({ status: 200, msg: "OK", value: true, productos });
        }else{
            logger.warn(`ERROR - No se encontró el carrito con ID: ${req.params.id}`)
            res.status(404).json({
                status: 404,
                msg: "ERROR - cart ID not found",
                value: false
            })
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const createCart = async(req, res) => {
    try{
        const cart = await BD_Carrito.createCarrito({ ownerId:req.user._id });
        if(cart){
            res.status(201).json({status: 201, msg: 'CREATED', value: true, cart})
        }else{
            logger.error("ERROR - No se pudo crear el carrito");
            res.status(500).json(errJSON('ERROR - While creating the cart'))
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const decreaseQuantityOnCart = async(req, res) => {
    try{
        const response = await BD_Carrito.decreaseProduct(req.user._id, req.params.id_prod);
        if(response.value){
            res.status(200).json({status: 200, msg: 'OK', value: true, cart: response.cart})
        }else{
            if(response.status === 500){
                logger.error(response.message);
                return res.status(500).json(errJSON(response.message));
            }else{
                logger.warn(response.message);
                res.status(response.status).json({
                    status: response.status, 
                    msg: `ERR - ${response.message}`,
                    value: false
                });
            }
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const deleteProductOnCart = async(req, res) => {
    try{
        const response = await BD_Carrito.deleteProduct(req.user._id, req.params.id_prod);
        if(response.value){
            res.status(200).json({status:200, msg: 'OK', value: true, cart: response.cart})
        }else{
            if(response.status === 500){
                logger.error(response.message);
                return res.status(500).json(errJSON(response.message));
            }else{
                logger.warn(response.message);
                res.status(response.status).json({
                    status: response.status,
                    msg: `ERR - ${response.message}`,
                    value: false
                })
            }
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const deleteCart = async(req, res) => {
    try{
        const cart = await BD_Carrito.deleteByID(req.params.id);
        if(cart){
            res.status(200).json({status: 200, msg: 'OK', value: true, cart})
        }else{
            logger.warn(`ERROR - No se encontró el carrito con ID: ${req.params.id}`)
            res.status(404).json({
                status: 404,
                msg: 'ERROR - Cart ID not found',
                value: false
            })
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

/* API PRODUCTOS */



const allProducts = async(req, res) => {
    try{
        const products = await BD_Productos.getAll();
        if(products){
            res.status(200).json({status: 200, msg: 'OK', value: true, products})
        }else{
            logger.error("ERROR - No se pudieron obtener los productos");
            res.status(500).json(errJSON());
        }
        return;
    }catch(e){
        logger.error(e);
        res.status(500).json(errJSON(e.message));
    }
}

const byProductId = async(req, res) => {
    try{
        const product = await BD_Productos.getById(req.params.id);
        if(product){
            res.status(200).json({status: 200, msg: 'OK', value: true, product})
        }else{
            logger.warn(`ERROR - No se encontró el producto con ID: ${req.params.id}`)
            res.status(404).json({
                status: 404, 
                msg: 'ERROR - Product ID not found',
                value: false
            })
        }
        return;
    }catch(e){
        logger.error(e);
        res.status(500).json(errJSON(e.message));
    }
}

const byCategory = async (req, res) => {
    try{
        const response = await BD_Productos.getByCategory(req.params.category);
        if(response.value){
            res.status(200).json({status: 200, msg: 'OK', value: true, products: response.products})
        }else{
            if(response.status === 500){
                logger.error(response.msg);
                res.status(500).json(errJSON(response.msg));
            }else{
                logger.warn(response.msg);
                res.status(response.status).json({
                    status: response.status,
                    msg: `ERROR - ${response.msg}`,
                    value: false
                })
            }
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const createProduct = async (req, res) => {
    try{
        if(BD_Productos.validateProduct(req.body)){
            const product = await BD_Productos.setProduct(req.body);
            if(product){
                res.status(201).json({status: 201, msg: 'CREATED', value: true, product})
            }else{
                logger.error('ERROR - No se pudo crear el producto');
                res.status(500).json(errJSON('ERROR - Se generó un error mientras se añadia el producto'))
            }
        } else {
            logger.warn('ERROR - invalid JSON structure');
            res.status(400).json({
                status: 400,
                msg: 'ERROR - invalid JSON structure',
                value: false
            });
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const consultQuantityOnPorduct = async(req, res) => {
    try{

        if(!parseInt(req.params.cant) && req.params.cant != "++"){
            logger.warn("ERROR - invalid quantity to consult");
            return res.status(400).json({status:400, msg: "ERROR - invalid quantity to consult", value: false});
        }if(req.params.cant < 1){
            logger.warn("ERROR - invalid quantity to consult");
            return res.status(400).json({status:400, msg: "ERROR - invalid quantity to consult", value: false});
        }

        const data = req.params;//{product_id, cant}
        data.user_cart = await BD_Carrito.getCartByUserID(req.user._id);
        const response = await BD_Productos.checkStock(data)

        if(response.value){
            res.status(200).json({status: 200, msg: 'OK', value: true})
        }else{
            if(response.status === 500){
                logger.error(response.message);
                res.status(500).json(errJSON(response.message));
            }else{
                logger.warn(response.message);
                res.status(response.status).json({ 
                    status: response.status, 
                    mg: `ERROR - ${response.message}`, 
                    value: false
                });
            }
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const updateProduct = async(req, res) => {
    try{
        if(BD_Productos.validateProduct(req.body)){
            const product = await BD_Productos.updateProduct(req.body, req.params.id)
            if(product){
                res.status(200).json({status: 200, msg: 'OK', value: true, product})
            }else{
                logger.warn(`ERROR - No se encontró el producto con ID: ${req.params.id}`)
                res.status(404).json({
                    status: 404,
                    msg: 'ERROR - Product ID not found',
                    value: false
                })
            }
        }else{
            logger.warn('ERROR - invalid JSON structure');
            res.status(400).json({
                status: 400,
                msg: 'ERROR - invalid JSON structure',
                value: false
            })
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const deleteProduct = async(req, res) => {
    try{
        const product = await BD_Productos.deleteByID(req.params.id);
        if(product){
            res.status(200).json({status: 200, msg: "OK", value: true, product})
        }else{
            logger.warn(`ERROR - No se encontró el producto con ID: ${req.params.id}`)
            res.status(404).json({
                status: 404,
                msg: "ERROR - Product ID not found",
                value: false
            });
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}


/* API AUTH */

const login = async(req, res) => {
    try{
        Passport.authenticate('login', { session: false }, (err, user, info) => {

            if(err){

                logger.error(`ERROR - ${err.message}`);

                return res.status(500).json({
                    status: 500,
                    msg: `ERROR - ${err.message}`,
                    value: false
                })

            }if(!user){

                logger.warn(`ERROR - ${info.message}`);

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

            req.session.jwt = generateToken(user)

            return res.status(202).json({
                status: 202,
                msg: 'ACEPTED',
                value: true,
                returnTo: req.returnTo || '/productos'
            })

        })(req, res)
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const register = async(req, res) => {
    try{
        Passport.authenticate('register', { session: false }, (err, user, info) => {

            if(err){

                logger.error(`ERROR - ${err.message}`);

                return res.status(500).json({
                    status: 500,
                    msg: `ERROR - ${err.message}`,
                    value: false
                })

            }if(!user){

                logger.warn(`ERROR - ${info.message}`);

                return res.status(409).json({
                    status: 409,
                    msg: `ERROR - ${info.message}`,
                    value: false,
                    returnTo: '/fail_register'
                })

            }

            req.session.jwt = generateToken(user)

            return res.status(201).json({
                status: 201,
                msg: 'CREATED',
                value: true,
                returnTo: req.returnTo || '/productos'
            })

        })(req, res)
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const logout = async(req, res) => {
    try{
        res.clearCookie('session');
        return req.session.destroy((err) =>{
            if(err){
                logger.error(`ERROR - ${err.message}`);
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
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}


/* API USER */


const allUsers = async(req, res) => {
    try{
        const users = await BD_Usuarios_Local.getAll();
        if(users){
            res.status(200).json({status: 200, msg: 'OK', value: true, users})
        }else{
            logger.error('ERROR - No se pudieron obtener todos los usuarios');
            res.status(500).json(errJSON());
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const userInfo = (req, res) => {
    try{
        return res.status(200).json({
            status: 200,
            msg: 'OK',
            value: true,
            user: req.user
        });
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
};

const getChat = async(req, res) => {
    try{
        const user = await BD_Usuarios_Local.getByEmail(req.params.mail);
        if(!user){
            logger.warn(`ERROR - No se encontró el usuario con eMail: ${req.params.mail}`);
            return res.status(404).json({
                status: 404,
                msg: 'ERROR - User eMail not found',
                value: false
            });
        }
        const messages = await BD_Mensajes.getByEmail(user._id);
        if(messages){
            res.status(200).json({status: 200, msg: 'OK', value: true, messages})
        }else{
            logger.error('ERROR - No se pudieron obtener los mensajes del usuario');
            res.status(500).json(errJSON());
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const getUserByID = async(req, res) => {
    try{
        const user = await BD_Usuarios_Local.getById(req.params.id)
        if(user){
            res.status(200).json({status:200,msg:'OK',value: true,user})
        }else{
            logger.warn(`ERROR - No se encontró el usuario con ID: ${req.params.id}`);
            res.status(404).json({
                status: 404,
                msg: 'ERROR - User ID not found',
                value: false
            });
        }
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
};

const userPurchase = async(req, res) => {
    try{
        const cartInfo = await BD_Carrito.getCartByUserID(req.user._id);
        const userInfo = await BD_Usuarios_Local.getById(req.user._id);
        const values = [0, 5, 10]

        if(!values.includes(parseInt(req.body.shipping))){
            logger.warn('ERROR - Valor de envío inválido');
            return res.status(400).json({
                status: 400,
                msg: "ERROR - Invalid shipping value",
                value: false
            });
        }else{
            cartInfo.shipping = req.body.shipping;
        }

        if(cartInfo.productos.length==0){

            logger.warn('ERROR - No hay productos en el carrito');
            return res.status(406).json({
                status: 406,
                msg: "ERROR - There are no products in the cart",
                value: false
            });

        }else if(await BD_Carrito.deleteByID(cartInfo._id)){
            const order = await BD_Ordenes.addNewOrder({userId: userInfo._id, cartInfo, shipping: req.body.shipping})
            if(!order.value){
                logger.error(`ERROR - ${order.message}`);
                return res.status(500).json(errJSON(order.message));
            }
            await sendMessages(order.newOrder);
            return res.status(200).json({status: 200, msg: "OK", value: true, returnTo: "/user/ordenes"})

        }else{
            logger.error('ERROR - No se pudo eliminar el carrito');
            return res.status(500).json(errJSON());
        }
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
};

const user_update = async(req, res) => {
    try{
        let oldAvatar, data = {};
        const {age, address, phone_number}= req.body;

        if(!validatePhoneE164(phone_number)){
            logger.warn('ERROR - Número de teléfono inválido');
            return res.status(400).json({status: 400, msg: "ERROR - Invalid Phone Number", value: false})
        };

        if(req.file){

            data.avatar = "/uploads/"+req.file.filename
            oldAvatar = await BD_Usuarios_Local.getAvatar(req.user._id)

        }else if(!age, !address, !phone_number){

            logger.warn('ERROR - No hay datos para actualizar');
            return res.status(400).json({status: 400, msg: "ERROR - Nothing to Update", value: false});

        }else{
            data.age = age;
            data.address = address;
            data.phone_number = phone_number;
        }
        
        if(await BD_Usuarios_Local.updateUser(req.user._id, data)){

            if(oldAvatar) {await deleteUserImg(oldAvatar)};
            
            const user = await BD_Usuarios_Local.getById(req.user._id);

            req.session.jwt = generateToken(user);

            res.status(200).json({status: 200, msg: "OK", value: true})

        }else{
            logger.error('ERROR - No se pudo actualizar el usuario');
            res.status(500).json({status: 500, msg: "ERROR", value: false});
        }
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
};

const completeRegister = async(req, res) => {
    try{
        const response = await BD_Usuarios_Local.completeRegister(req.body);
        if(response.status==500){
            logger.error(`ERROR - ${response.msg}`);
            return res.status(500).json(errJSON(response.msg));
        }
        if(response.value){
            sendEmail(response.user);
            res.status(200).json({status: 200, msg: 'Registro completado', user: response.user})
        }else{
            logger.warn(`ERROR - ${response.msg}`);
            res.status(response.status).json({status: response.status, msg: response.msg, value: false});
        }
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
    }
}

const deleteUser = async(req, res) => {
    try{
        const avatar = await BD_Usuarios_Local.getAvatar(req.user._id);
        await deleteUserImg(avatar);
        const user = await BD_Usuarios_Local.deleteByID(req.user._id);
        if(user){
            res.status(200).json({status: 200, msg: "OK", value: true, user})
        }else{
            logger.warn(`ERROR - No se encontró el usuario con ID: ${req.params.id}`);
            res.status(500).json({
                status: 500, 
                msg: "ERROR - User ID not found", 
                value: false
            });
        }
        req.session.destroy((err)=>{
            if(err){
                logger.error(`ERROR - ${err}`);
            }
        });
        return;
    }catch(e){
        logger.error(e);
        return res.status(500).json(errJSON(e.message));
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
        deleteProductOnCart,
    },
    products: {
        allProducts,
        byProductId,
        byCategory,
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
        getChat,
        deleteUser,
        user_update,
        userInfo,
        getUserByID,
        completeRegister,
    }
};