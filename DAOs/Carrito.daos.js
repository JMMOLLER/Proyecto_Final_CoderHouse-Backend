const mongoose = require("mongoose");
const { CarritoModel } = require("../models/CarritoModel");

class Carrito{

    constructor(){
        this.url = 
        "mongodb+srv://Admin23:ProyectoCoder@backend-coderhouse.r8d7zxk.mongodb.net/eCommerce";
        this.mongodb = mongoose.connect;
    }

    async getAll(){
        try{
            await this.mongodb(this.url);
            return await CarritoModel.find();
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getById(id){
        try{
            await this.mongodb(this.url);
            const doc = await CarritoModel.findById(id);
            if(doc==null){throw new Error()}
            return doc;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async createCarrito(){
        try{
            await this.mongodb(this.url);
            const newCarrito = new CarritoModel({timestamp:this.setTimestamp(new Date())});
            return await newCarrito.save()
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async setProduct(id_carrito, id_producto){
        try{
            await this.mongodb(this.url);
            if(!await this.getById(id_carrito)){return false;}
            const productos_carrito = []
            let exists = false;
            await this.getById(id_carrito).then( element => element.productos.map(producto => { productos_carrito.push(producto); }));
            for (let index = 0; index < productos_carrito.length; index++) {
                if(productos_carrito[index].id == id_producto){
                    productos_carrito[index].quantity = productos_carrito[index].quantity+1;
                    exists=true;
                    break;
                }
            }
            if(!exists){
                productos_carrito.push({id:id_producto, quantity:1})
            }
            const doc = await CarritoModel.findById(id_carrito);
            doc.productos = productos_carrito;
            doc.save();
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async deleteProduct(id_carrito, id_producto){
        try{
            if(!await this.getById(id_carrito)){throw new Error()}
            await this.mongodb(this.url);
            let productos_carrito = [];
            let cantidad = 0;
            await this.getById(id_carrito).then( element => element.productos.map(producto => { productos_carrito.push(producto); }));
            for (let index = 0; index < productos_carrito.length; index++) {
                if(productos_carrito[index].id == id_producto){
                    cantidad = productos_carrito[index].quantity-1;
                    if(cantidad==0){
                        productos_carrito = productos_carrito.filter(producto => producto.id!=id_producto);
                    }else{
                        productos_carrito[index].quantity = cantidad;
                    }
                    break;
                }
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
            await this.mongodb(this.url);
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
            if(producto.id){throw new Error('invalid structure')}
            if(producto.timestamp){throw new Error('invalid structure')}
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