const { sendMessages } = require('../Services/API.service');
const { deleteUserImg } = require('../Services/API.service');
const { BD_Carrito } = require('../../DB/DAOs/Carrito.daos.js');
const { BD_Productos } = require('../../DB/DAOs/Productos.daos.js');
const { BD_Usuarios_Local } = require('../../DB/DAOs/Usuarios_Local');

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
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
}

const createCart = async(req, res) => {
    const new_carrito = await BD_Carrito.createCarrito(req.session.passport.user);
    !new_carrito
        ? res.json({status: 'ERROR - while creating carrito'})
        : res.send(new_carrito)
}

const addProductOnCart = async(req, res) => {
    try{
        const id_carrito = await BD_Carrito.getIDcartByUserID(req.session.passport.user)
        const id_producto = req.params.id2;
        const status = await BD_Carrito.setProduct({id_carrito, id_producto});
        !status
            ? res.json({status: 'ERROR - ID Carrito no existe'})
            : res.json({status: 'OK'});
    }catch{
        res.json({status: 'ERROR', message: 'an error was encountered while processing the request'});
    }
}

const deleteCart = async(req, res) => {
    try{
        const status = await BD_Carrito.deleteByID(req.params.id);
        !status
            ? res.json({status: 'ERROR - ID Carrito no existe'})
            : res.json({status: 'OK'});
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
}

const deleteProductOnCart = async(req, res) => {
    try{
        const status = await BD_Carrito.deleteProduct(req.params.id, req.params.id_prod);
        status.length == 2
            ? res.json({status: 'ERROR - ID Carrito no existe'})
            : res.json({status: 'OK'});
    }catch{
        res.json({status: 'ERROR - an error was encountered while processing the request'});
    }
}



/* API PRODUCTOS */



const allProducts = async(req, res) => {
    res.json(await BD_Productos.getAll());
}

const byProductId = async(req, res) => {
    const producto = await BD_Productos.getById(req.params.id);
    typeof producto != 'boolean'
        ? res.json(producto)
        : res.json({status: 'ERROR - ID Product not exists'})
}

const createProduct = async (req, res) => {
    console.log(req.body);
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



const checkLogin = (req, res) => {
    res.json({status: req.isAuthenticated()});
};

const buy = async(req, res) => {
    const cartID = await BD_Carrito.getIDcartByUserID(req.session.passport.user);
    const USER = await BD_Usuarios_Local.getById(req.session.passport.user);
    if(cartID.productos.length==0){
        res.json({status: false, message: "No hay productos en el carrito"});
        return;
    }
    if(await BD_Carrito.deleteByID(cartID._id)){
        await sendMessages(USER);
        res.json({status: true,message: "OK"})
    }else{
        res.json({status: false,message: "ERROR"});
    }
};

const deleteUser = async(req, res) => {
    const user = await BD_Usuarios_Local.getById(req.session.passport.user);
    await deleteUserImg(user.avatar);
    await BD_Usuarios_Local.deleteByID(req.session.passport.user)
        ? res.json({status: true})
        : res.json({status: false});
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
        deleteProductOnCart
    },
    products: {
        allProducts,
        byProductId,
        createProduct,
        updateProduct,
        deleteProduct
    },
    user: {
        checkLogin,
        buy,
        deleteUser,
    }
};