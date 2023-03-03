const { sendMessages } = require('../Services/API.service');
const { deleteUserImg } = require('../Services/API.service');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.daos.js');
const { BD_Productos } = require('../../DB/DAOs/Productos.daos.js');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local');
const jwt = require('jsonwebtoken');
const errJSON = (e) => {
    if(!e){
        e = "ERROR - An error has occurred while processing the request"
    }return {
        status: 500,
        msg: e,
        value: false
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
            ? res.status(200).json({status: 200, msg: 'OK', value: true, cart})
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

const consultQuantityOnPorduct = async(req, res) => {
    try{
        const data = req.params;//{id_prod, cant}
        if(data.cant == "++")
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


const decreaseQuantityOnCart = async(req, res) => {
    try{
        const response = await BD_Carrito.decreaseProduct(req.user._id, req.params.id_prod);
        response
            ? res.status(200).json({status: 200, msg: 'OK', value: true, cart: response})
            : res.status(404).json({
                status: 404, 
                msg: 'ERR - Cart ID not found', 
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
        const cart = await BD_Carrito.deleteProduct(req.user._id, req.params.id_prod);
        cart
            ? res.status(200).json({status:200, msg: 'OK', value: true, cart})
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
        const productos = await BD_Productos.getAll();
        productos
            ? res.status(200).json({status: 200, msg: 'OK', value: true, productos})
            : res.status(500).json(errJSON());
        return;
    }catch(e){
        console.log(e);
        res.status(500).json(errJSON(e.message));
    }
}

const byProductId = async(req, res) => {
    try{
        const producto = await BD_Productos.getById(req.params.id);
        producto
            ? res.status(200).json({status: 200, msg: 'OK', value: true, producto})
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
            const producto = await BD_Productos.setProduct(req.body);
            producto
                ? res.status(201).json({status: 201, msg: 'CREATED', value: true, producto})
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
        cartInfo.shipping = req.body.shipping;
        if(cartInfo.productos.length==0){
            return res.status(406).json({
                status: 406,
                msg: "No se puede realizar una compra sin productos en el carrito",
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
        let oldAvatar;
        const data = req.body

        if(req.file){
            data.avatar = "/uploads/"+req.file.filename
            oldAvatar = await BD_Usuarios_Local.getAvatar(req.user._id)
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
        await BD_Usuarios_Local.deleteByID(req.user._id)
            ? res.status(200).json({status: 200, msg: "OK", value: true})
            : res.status(500).json({
                status: 500, 
                msg: "ERROR - User ID not found", 
                value: false
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
        consultQuantityOnPorduct,
        deleteProductOnCart
    },
    products: {
        allProducts,
        byProductId,
        createProduct,
        updateProduct,
        deleteProduct,
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