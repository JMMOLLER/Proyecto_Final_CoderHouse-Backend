const mongoose = require("mongoose");
const { CarritoModel } = require("../models/CarritoModel");
const { BD_Productos } = require('./Productos.dao');
const logger = require("../../utils/LoggerConfig");

class Carrito{

    /**
     * It connects to the database.
     */
    constructor(){
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    /**
     * It connects to the database, then it returns all the documents in the collection.
     * @returns The result of the query.
     */
    async getAll(){
        try{
            this.mongodb(this.url);
            return await CarritoModel.find().select('-__v');
        }catch(err){
            logger.error(err);
            return false;
        }
    }

    /**
     * It connects to the database, then it searches for a document with the given id, if it doesn't
     * find it, it throws an error, if it finds it, it returns the document.
     * @param id - The id of the document to be retrieved.
     * @returns The document with the id that was passed as a parameter.
     */
    async getById(id){
        try{
            this.mongodb(this.url);
            const doc = await CarritoModel.findById(id).select('-__v');
            if(!doc){
                logger.warn("No se encontro el carrito con el id: " + id);
                return false;
            }
            return doc;
        }catch(err){
            logger.error(err);
            return false;
        }
    }

    /**
     * It connects to the database, then it searches for a document with the given UID, if it doesn't
     * find it, it creates a new one
     * @param UID - The user ID
     * @returns a promise.
     */
    async getCartByUserID(UID){
        try{
            this.mongodb(this.url);
            let doc = await CarritoModel.findOne({owner:UID});
            if(!doc){
                doc = await this.createCarrito({ownerId:UID});
            }
            return doc;
        }catch(err){
            logger.error(err);
            return false;
        }
    }

    /**
     * It takes an array of objects, each object has an id and a quantity, and it returns an array of
     * objects, each object has an id, a quantity, and a bunch of other properties.
     * 
     * The function is async, so it returns a promise.
     * 
     * The function uses a for loop to iterate over the array of objects.
     * 
     * For each object in the array, it calls a function called BD_Productos.getById(element.id) and
     * assigns the result to a variable called doc.
     * 
     * It then adds a property called quantity to the doc object, and assigns the value of
     * element.quantity to it.
     * 
     * It then pushes the doc object to an array called array_cart.
     * 
     * When the for loop is done, it returns the array_cart.
     * @param id_productos - [{id: "5d8f8f8f8f8f8f8f8f8f8f8f", quantity: 1}, {id:
     * "5d8f8f8f8f8f8f8f8f8f8f
     * @returns An array of objects.
     */
    async getInfoProducts(id_productos){
        try{
            const array_cart = []
            for (let index = 0; index < id_productos.length; index++) {
                const element = id_productos[index];
                const doc = await BD_Productos.getById(element.id);
                doc.quantity = element.quantity;
                array_cart.push(doc);
            }
            return array_cart;
        }catch(err){
            logger.error(err);
            return false;
        }
    }

    
    /**
     * It creates a new cart for a user if the user doesn't have one, and if the user does have one, it
     * returns the user's cart.
     * </code>
     * @returns The cart object.
     */
    async createCarrito({ ownerId }){
        try{
            this.mongodb(this.url);
            const newCarrito = {};
            newCarrito.cart = await CarritoModel.findOne({owner: ownerId});
            if(!newCarrito.cart){
                logger.warn("No se encontro el carrito del usuario. Se creará uno nuevo");
                newCarrito.cart = new CarritoModel({owner: ownerId});
                await newCarrito.cart.save()
            }
            return newCarrito.cart;
        }catch(err){
            logger.error(err);
            return false;
        }
    }

    
    /**
     * It adds a product to a cart
     * @returns an object with the following properties:
     * - value: boolean, true if the operation was successful, false otherwise
     * - message: string, a message describing the result of the operation
     * - status: number, the HTTP status code of the operation
     * - content: object, the document of the cart that was modified
     */
    async addProduct({id_carrito, id_producto}){
        try{
            this.mongodb(this.url);

            const carritoDoc = await this.getById(id_carrito);
            const productoDoc = await BD_Productos.getById(id_producto);

            if(!carritoDoc){
                logger.warn("No se encontro el carrito solicitado");
                return { value: false, message: 'Cart ID not found', status: 404 };
            }
            if(!productoDoc){
                logger.warn("No se encontro el producto solicitado");
                return { value: false, message: 'Product ID not found', status: 404 };
            }

            const productos_carrito = carritoDoc.productos;//guarda los productos del carrito
            const index = productos_carrito.findIndex(producto => producto.id == id_producto);//busca el id del producto recibido en el carrito
            
            if(index > -1){
                //consulta si hay stock disponible
                const isAvailable = await BD_Productos.checkStock({product_id: id_producto, cant: "++", user_cart: carritoDoc})

                if(!isAvailable.value){
                    logger.warn("No hay stock disponible para el producto solicitado");
                    return { value: false, message: isAvailable.message, status: 409 };
                }

                productos_carrito[index].quantity = productos_carrito[index].quantity+1//si el producto ya existe en el carrito, aumenta la cantidad en 1
            }else{
                productos_carrito.push({id: id_producto, quantity: 1})//si el producto no existe en el carrito, lo agrega
            }

            carritoDoc.productos = productos_carrito;//actualiza los productos del carrito
            await CarritoModel.findByIdAndUpdate(id_carrito, carritoDoc);//actualiza el carrito en la base de datos

            return { value: true, message: 'Product added to cart', status: 200, content: carritoDoc };
        }catch(err){
            logger.error(err);
            return { value: false, message: err.message, status: 500 };
        }
    }

    
    /**
     * It decreases the quantity of a product in a cart
     * @param user_id - the user id
     * @param id_producto - The id of the product to be removed from the cart
     * @returns The return is a promise, so you need to use await or .then() to get the value.
     */
    async decreaseProduct(user_id, id_producto){
        try{

            this.mongodb(this.url);
            let productos_carrito = [];
            let cantidad = 0;

            const carritoDoc = await this.getCartByUserID(user_id)
            const productoDoc = await BD_Productos.getById(id_producto);

            if(!carritoDoc){
                logger.warn("No se encontro el carrito solicitado");
                return {value: false, message: 'Cart ID not found', status: 404}
            }
            if(!productoDoc){
                logger.warn("No se encontro el producto solicitado");
                return {value: false, message: 'Product ID not found', status: 404}
            }

            productos_carrito = carritoDoc.productos
            const index = productos_carrito.findIndex(producto => producto.id == id_producto);

            if(index > -1){
                cantidad = productos_carrito[index].quantity-1;
                cantidad == 0 
                    ? productos_carrito = productos_carrito.filter(producto => producto.id!=id_producto)
                    : productos_carrito[index].quantity = cantidad;
            }

            carritoDoc.productos = productos_carrito;

            await CarritoModel.findByIdAndUpdate(carritoDoc._id, carritoDoc);

            return {value: true, status: 200, cart:carritoDoc}; 

        }catch(err){
            logger.error(err);
            return {value: false, message: err.message, status: 500};
        }
    }

    /**
     * It deletes a product from a cart
     * @param user_id - The user's ID
     * @param id_producto - The ID of the product to be deleted
     * @returns The return is a promise, so you need to use await or .then() to get the value.
     */
    async deleteProduct(user_id, id_producto){
        try{

            this.mongodb(this.url);
            let productos_carrito = [];

            const carritoDoc = await this.getCartByUserID(user_id)
            const productoDoc = await BD_Productos.getById(id_producto);

            if(!carritoDoc){
                logger.warn("No se encontro el carrito solicitado");
                return {value: false, message: 'Cart ID not found', status: 404}
            }

            if(!productoDoc){
                logger.warn("No se encontro el producto solicitado");
                return {value: false, message: 'Product ID not found', status: 404}
            }

            productos_carrito = carritoDoc.productos;

            productos_carrito = productos_carrito.filter(producto => producto.id!=id_producto);

            carritoDoc.productos = productos_carrito;

            await CarritoModel.findByIdAndUpdate(carritoDoc._id, carritoDoc);

            return {value: true, status: 200, cart:carritoDoc};
            
        }catch(err){
            logger.error(err);
            return {value: false, message: err.message, status: 500};
        }
    }

    /**
     * It deletes a row from a JSON file
     * @param id - The id of the cart to be deleted
     * @returns an array with two elements. The first element is a boolean that indicates if the
     * operation was successful or not. The second element is the error message if the operation was
     * not successful.
     */
    async deleteByID(id) {
        try{
            this.mongodb(this.url);
            return await CarritoModel.findByIdAndDelete(id);;
        }catch(err){
            this.log(err);
            return false;
        }
    }

}

const BD_Carrito = new Carrito();

module.exports = { BD_Carrito };