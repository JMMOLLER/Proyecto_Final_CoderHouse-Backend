const { sendMessages } = require('../Services/API.service');
const { deleteUserImg } = require('../Services/API.service');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.daos.js');
const { BD_Productos } = require('../../DB/DAOs/Productos.daos.js');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local');
const jwt = require('jsonwebtoken');
const errJSON = {
    status: 501,
    msg: 'an error was encountered while processing the request',
    value: false
}
/* =========== ROUTES =========== */

/* API CARRITO */
const allCarts = async(req, res) => {
    res.send(await BD_Carrito.getAll());
}

const byCartId = async(req, res) => {
    const status = await BD_Carrito.getById(req.params.id);
    !status
        ? res.json({status: "ERROR - ID Carrito no existe"})
        : res.send(status);
}

const getCartProducts = async(req, res) => {
    try {
        const status = await BD_Carrito.getById(req.params.id);
        if(status){
            console.log(status.productos);
            if(status.productos.length != 0){
                /* DEVUELVE UNA LISTA DE IDs Y CON LA CLASE PRODUCTOS VAMOS RETORNANDO LOS VALORES COMPLETOS */
                const datos = status.productos.map((id) => { return id });
                const productos = []
                for(let i = 0; i < datos.length; i++){
                    productos.push(await BD_Productos.getById(datos[i].id));
                }
                res.json(productos);
            }else{
                res.json({productos: 'El carrito de este usuario esta vacío'})
            }
        }else{
            res.json({status: "ERROR - ID Carrito no existe"})
        }
    }catch(e){
        console.log(e);
        res.json(errJSON);
    }
}

const createCart = async(req, res) => {
    const new_carrito = await BD_Carrito.createCarrito(req.user._id);
    !new_carrito
        ? res.json({status: 'ERROR - while creating carrito'})
        : res.send(new_carrito)
}

const addProductOnCart = async(req, res) => {
    try{
        const id_carrito = await BD_Carrito.getCartByUserID(req.user._id)
        const id_producto = req.params.prod;
        const status = await BD_Carrito.addProduct({id_carrito: id_carrito._id, id_producto});
        status
            ? res.json({ status: 204, value: true, msg: 'OK' })
            : res.json({ status: 502, value: false, msg: 'ERROR'});
    }catch(e){
        console.log(e);
        res.json(errJSON);
    }
}

const consultQuantityOnPorduct = async(req, res) => {
    try{
        const data = {};
        data.product_id = req.params.id;
        data.cant = req.params.cant;
        if(data.cant == "++")
            data.user_cart = await BD_Carrito.getCartByUserID(req.user._id);
        await BD_Productos.checkStock(data)
            ? res.status(200).json({status: 200, msg: 'OK', value: true})
            : res.status(409).json({ status: 409, mg: 'ERROR', value: false})
    }catch(e){
        console.log(e);
        res.json(errJSON);
    }
}

const deleteCart = async(req, res) => {
    try{
        const status = await BD_Carrito.deleteByID(req.params.id);
        !status
            ? res.json({status: 'ERROR - ID Carrito no existe'})
            : res.json({status: 'OK'});
    }catch(e){
        console.log(e);
        res.json(errJSON);
    }
}

const decreaseQuantityOnCart = async(req, res) => {
    try{
        const CartID = await BD_Carrito.getCartByUserID(req.user._id);
        const status = await BD_Carrito.decreaseProduct(CartID._id, req.params.id_prod);
        status.length == 2
            ? res.json({status: 'ERROR', value: false})
            : res.json({status: 'OK', value: true});
    }catch(e){
        console.log(e);
        res.json(errJSON);
    }
}

const deleteProductOnCart = async(req, res) => {
    try{
        const CartID = await BD_Carrito.getCartByUserID(req.user._id);
        const status = await BD_Carrito.deleteProduct(CartID._id, req.params.id_prod);
        status.length == 2
            ? res.json({status: 'ERROR', value: false})
            : res.json({status: 'OK', value: true});
    }catch(e){
        console.log(e);
        res.json(errJSON);
    }
}


/* API PRODUCTOS */



const allProducts = async(req, res) => {
    const productos = await BD_Productos.getAll();
    if(productos)
        return res.json({status: 'OK', value: true, productos});
    else
        return res.json({
            status: 'ERROR', 
            msg: 'an error was encountered while processing the request', 
            value: false
        });
}

const byProductId = async(req, res) => {
    const producto = await BD_Productos.getById(req.params.id);
    typeof producto != 'boolean'
        ? res.json(producto)
        : res.json({status: 'ERROR - ID Product not exists'})
}

const createProduct = async (req, res) => {
    if(BD_Productos.validateProduct(req.body)){
        const status = await BD_Productos.setProduct(req.body);
        !status
            ? res.json({status: 'ERROR - Se generó un error mientras se añadia el producto'})
            : res.json({status: 'OK'});
    } else {
        res.json({status: 'ERROR - invalid JSON structure'});
    }
}

const updateProduct = async(req, res) => {
    console.log(req.params.id);
    if(BD_Productos.validateProduct(req.body)){
        await BD_Productos.updateProduct(req.body, req.params.id)
            ? res.json({status: 'OK'})
            : res.json({status: 'ERROR - ID_producto not exists'})
    }else{
        res.json({status: 'ERROR - invalid JSON structure'})
    }
}

const deleteProduct = async(req, res) => {
    console.log(req.params.id);
    if(await BD_Productos.deleteByID(req.params.id)){
        res.json({status: "OK"});
    }else{
        res.json({status: "ERROR - ID not exists"});
    }
}



/* API USER */


const userInfo = (req, res) => {
    res.json(req.user);
};

const Info = async(req, res) => {
    const info = await BD_Usuarios_Local.getById(req.params.id)
    if(info){
        res.json(info);
    }else{
        res.json({status: 'ERROR - ID not exists'});
    }
};

const purchase = async(req, res) => {
    const cartInfo = await BD_Carrito.getCartByUserID(req.user._id);
    const userInfo = await BD_Usuarios_Local.getById(req.user._id);
    cartInfo.shipping = req.body.shipping;
    if(cartInfo.productos.length==0){
        return res.json({status: false, message: "No hay productos en el carrito"});
    }
    else if(await BD_Carrito.deleteByID(cartInfo._id)){
        await sendMessages({userInfo, cartInfo});
        return res.json({status: true, message: "OK"})
    }else{
        return res.json({status: false, message: "ERROR"});
    }
};

const user_update = async(req, res) => {
    try{
        let oldAvatar;
        
        const data = {
            age: req.body.age,
            address: req.body.address,
            phone_number: req.body.phone_number
        }
        if(req.file){
            data.avatar = "/uploads/"+req.file.filename
            oldAvatar = await BD_Usuarios_Local.getAvatar(req.user._id)
        }
        if(await BD_Usuarios_Local.updateUser(req.user._id, data)){

            if(oldAvatar) {await deleteUserImg(oldAvatar)};
            
            const user = await BD_Usuarios_Local.getById(req.user._id);

            req.session.jwt = jwt.sign({ user }, process.env.COOKIE_SECRET);

            res.status(200).json({status: 204, msg: "OK", value: true})

        }else{
            res.status(500).json({status: 500, msg: "ERROR", value: false});
        }
    }catch(e){
        console.log(e);
        res.json(errJSON);
    }
};

const deleteUser = async(req, res) => {
    try{
        const user = await BD_Usuarios_Local.getById(req.user._id);
        await deleteUserImg(user.avatar);
        await BD_Usuarios_Local.deleteByID(req.user._id)
            ? res.json({status: 200, msg: "OK", value: true})
            : res.json({status: 500, msg: "ERROR", value: false});
    }catch(e){
        console.log(e);
        res.json(errJSON);
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
        buy: purchase,
        deleteUser,
        user_update,
        userInfo,
        Info,
    }
};