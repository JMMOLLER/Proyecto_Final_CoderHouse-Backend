const mongoose = require("mongoose");
const { CarritoModel } = require("../models/CarritoModel");
const { BD_Productos } = require('./Productos.dao');

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
            console.log(err);
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
            if(doc==null){throw new Error()}
            return doc;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getCartByUserID(UID){
        try{
            this.mongodb(this.url);
            let doc = await CarritoModel.findOne({owner:UID});
            if(doc==null){
                await this.createCarrito({ownerId:UID})
                doc = await CarritoModel.findOne({owner:UID});
            }
            return doc;
        }catch(err){
            console.log(err);
            return false;
        }
    }

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
            console.log('\x1b[31m%s\x1b[0m',err);
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
                newCarrito.cart = new CarritoModel({owner: ownerId});
                await newCarrito.cart.save()
            }
            return newCarrito.cart;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    /**
     * It takes an id_carrito and an id_producto, and if the id_producto is already in the carrito, it
     * increases the quantity of that producto by 1, otherwise it adds the producto to the carrito
     * @param id_carrito - the id of the cart
     * @param id_producto - id of the product
     * @returns a boolean value.
     */
    async addProduct({id_carrito, id_producto}){
        const response = {};
        try{
            this.mongodb(this.url);

            const carritoDoc = await this.getById(id_carrito);
            const productoDoc = await BD_Productos.getById(id_producto);
            if(!carritoDoc){
                response.value = false;
                response.message = 'Cart ID not found';
                response.status = 404;
                return response;
            }
            if(!productoDoc){
                response.value = false;
                response.message = 'Product ID not found';
                response.status = 404;
                return response;
            }

            const productos_carrito = carritoDoc.productos;//guarda los productos del carrito
            const index = productos_carrito.findIndex(producto => producto.id == id_producto);//busca el id del producto recibido en el carrito
            if(index > -1){
                //consulta si hay stock disponible
                const isAvailable = await BD_Productos.checkStock({product_id: id_producto, cant: "++", user_cart: carritoDoc})
                if(!isAvailable.value){
                    response.value = false;
                    response.message = isAvailable.message;
                    response.status = 409;
                    return response;
                }
                productos_carrito[index].quantity = productos_carrito[index].quantity+1//si el producto ya existe en el carrito, aumenta la cantidad en 1
            }else{
                productos_carrito.push({id: id_producto, quantity: 1})//si el producto no existe en el carrito, lo agrega
            }
            carritoDoc.productos = productos_carrito;//actualiza los productos del carrito
            await CarritoModel.findByIdAndUpdate(id_carrito, carritoDoc);//actualiza el carrito en la base de datos

            response.value = true;
            response.content = carritoDoc;
            return response;
        }catch(err){
            console.log(err);
            response.value = false;
            response.message = err.message;
            response.status = 500;
            return response;
        }
    }

    /**
     * It deletes a product from a shopping cart
     * @param id_carrito - the id of the cart
     * @param id_producto - id of the product to be deleted
     * @returns The result of the operation.
     */
    async decreaseProduct(user_id, id_producto){
        try{
            this.mongodb(this.url);
            let productos_carrito = [];
            let cantidad = 0;
            const carritoDoc = await this.getCartByUserID(user_id)
            const productoDoc = await BD_Productos.getById(id_producto);

            if(!carritoDoc){return {value: false, message: 'Cart ID not found', status: 404}}
            if(!productoDoc){return {value: false, message: 'Product ID not found', status: 404}}

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
            console.log(err);
            return {value: false, message: err.message, status: 500};
        }
    }

    async deleteProduct(user_id, id_producto){
        try{
            this.mongodb(this.url);
            let productos_carrito = [];
            const carritoDoc = await this.getCartByUserID(user_id)
            const productoDoc = await BD_Productos.getById(id_producto);
            if(!carritoDoc){return {value: false, message: 'Cart ID not found', status: 404}}
            if(!productoDoc){return {value: false, message: 'Product ID not found', status: 404}}
            productos_carrito = carritoDoc.productos;
            productos_carrito = productos_carrito.filter(producto => producto.id!=id_producto);
            carritoDoc.productos = productos_carrito;
            await CarritoModel.findByIdAndUpdate(carritoDoc._id, carritoDoc);
            return {value: true, status: 200, cart:carritoDoc};
        }catch(err){
            console.log(err);
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
            console.log(err);
            return false;
        }
    }

    /**
     * It validates a product object, and returns true if it's valid, or false if it's not.
     * @param producto - The product object to be validated.
     * @returns A boolean value.
     */
    validateProduct(producto){
        try{
            if(producto.id){throw new Error('Product id is not required')}
            if(producto.timestamp){throw new Error('Product timestamp is not required')}
            if(!producto.tittle){throw new Error('Product tittle is required')}
            if(!producto.description){throw new Error('Product description is required')}
            if(!producto.thumbnail){throw new Error('Product thumbnail is required')}
            if(!producto.price){throw new Error('Product price is required')}
            if(!producto.stock){throw new Error('Product stock is required')}
            return true;
        }catch(err){
            this.log(err);
            return false;
        }
    }

    /**
     * It takes a date object and returns a string in the format dd/mm/yyyy.
     * @param date - The date object to be formatted.
     * @returns The date in the format dd/mm/yyyy
     */
    setTimestamp(date) {
        return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
    }

    /**
     * It generates a random number between 10 and 99, then adds a dash, then generates a random number
     * between 100 and 999, then adds a dash, then generates a random number between 1000 and 9999.
     * @returns A string of numbers separated by dashes.
     */
    generateCode(){
        return Math.floor((Math.random() * (99 - 10 + 1)) + 10)+
            '-'+Math.floor((Math.random() * (999 - 100 + 1)) + 100)+
            '-'+Math.floor((Math.random() * (9999 - 1000 + 1)) + 1000);
    }
}

const BD_Carrito = new Carrito();

module.exports = { BD_Carrito };