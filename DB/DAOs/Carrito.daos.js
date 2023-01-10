const mongoose = require("mongoose");
const { CarritoModel } = require("../models/CarritoModel");
const { BD_Productos } = require('./Productos.daos');

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
            await this.mongodb(this.url);
            return await CarritoModel.find();
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
            const doc = await CarritoModel.findById(id);
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
                await this.createCarrito(UID)
                doc = await CarritoModel.findOne({owner:UID});
            }
            return doc;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getIDcartByUserID(UID){
        try{
            this.mongodb(this.url);
            let doc = await CarritoModel.findOne({owner:UID});
            if(doc==null){
                await this.createCarrito(UID)
                doc = await CarritoModel.findOne({owner:UID});
            }
            doc._id = doc._id.toString();
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
            console.log(err);
            return false;
        }
    }

    /**
     * It creates a new carrito (cart) in the database.
     * @returns The newCarrito object is being returned.
     */
    async createCarrito(id){
        try{
            this.mongodb(this.url);
            const newCarrito = new CarritoModel({
                timestamp:this.setTimestamp(new Date()), 
                owner:id
            });
            return await newCarrito.save()
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
    async setProduct({id_carrito, id_producto}){
        try{
            this.mongodb(this.url);
            if(!await this.getById(id_carrito)){return false;}
            const productos_carrito = []
            await this.getById(id_carrito).then(
                element => element.productos.map(
                    producto => { 
                        productos_carrito.push(producto);
                    }
                )
            );
            const index = productos_carrito.findIndex(producto => producto.id === id_producto);
            index > -1 
                ? productos_carrito[index].quantity = productos_carrito[index].quantity+1 
                : productos_carrito.push({id:id_producto, quantity:1})
            const doc = await CarritoModel.findById(id_carrito);
            doc.productos = productos_carrito;
            doc.save();
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    /**
     * It deletes a product from a shopping cart
     * @param id_carrito - the id of the cart
     * @param id_producto - id of the product to be deleted
     * @returns The result of the operation.
     */
    async deleteProduct(id_carrito, id_producto){
        try{
            if(!await this.getById(id_carrito)){throw new Error()}
            this.mongodb(this.url);
            let productos_carrito = [];
            let cantidad = 0;
            await this.getById(id_carrito).then(
                element => element.productos.map(
                    producto => {
                        productos_carrito.push(producto);
                    }
                )
            );
            const index = productos_carrito.findIndex(producto => producto.id === id_producto);
            if(index > -1){
                cantidad = productos_carrito[index].quantity-1;
                cantidad == 0 
                    ? productos_carrito = productos_carrito.filter(producto => producto.id!=id_producto)
                    : productos_carrito[index].quantity = cantidad;
            }
            const doc = await CarritoModel.findById(id_carrito);
            doc.productos = productos_carrito;
            doc.save();
            return [true];
        }catch(err){
            console.log(err);
            return [false, err];
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
            await CarritoModel.findByIdAndDelete(id);
            return true;
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