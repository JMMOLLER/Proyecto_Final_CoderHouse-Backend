const mongoose = require("mongoose");
const { ProductModel } = require("../models/ProductsModel");

class Productos {
    
    constructor(){
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    async getAll(){
        try{
            this.mongodb(this.url);
            return await ProductModel.find();
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getById(id){
        try{
            this.mongodb(this.url);
            return await ProductModel.findById(id).lean();
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async setProduct(new_data){
        try{
            new_data['code']=this.generateCode();
            this.mongodb(this.url);
            const newProduct = new ProductModel(new_data);
            await newProduct.save();
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async checkStock({product_id, cant, user_cart}){
        try{
            const data_to_check = await this.getById(product_id);
            if(typeof data_to_check === 'boolean'){throw new Error('ID_producto not exists')};
            if(cant=="++"){
                user_cart.productos.forEach(element => {
                    if(element.id==product_id){
                        cant=element.quantity+1;
                    }
                });
            }
            if(data_to_check.stock>=cant){return true};
            return false;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async updateProduct(new_data, id_producto){
        try{
            const data_to_update = this.getById(id_producto);
            if(typeof data_to_update === 'boolean'){throw new Error('ID_producto not exists')};
            new_data['timestamp']=this.setTimestamp(new Date());
            this.mongodb(this.url);
            await ProductModel.findByIdAndUpdate(id_producto,new_data);
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async deleteByID(id) {
        try{
            this.mongodb(this.url);
            await ProductModel.findByIdAndDelete(id)
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    validateProduct(producto){
        try{
            if(producto.id){throw new Error('id is auto generated')}
            if(producto.timestamp){throw new Error('timestamp is auto generated')}
            if(producto.code){throw new Error('code is auto generated')}
            if(!producto.title){throw new Error('tittle is required')}
            if(!producto.brand){throw new Error('brand is required')}
            if(!producto.thumbnail){throw new Error('thumbnail is required')}
            if(!producto.price){throw new Error('price is required')}
            if(!producto.stock){throw new Error('stock is required')}
            return true;
        }catch(e){
            console.log('\x1b[31m%s\x1b[0m', e.message);
            return false;
        }
    }

    setTimestamp(date) {
        return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
    }

    generateCode(){
        return Math.floor((Math.random() * (99 - 10 + 1)) + 10)+
            '-'+Math.floor((Math.random() * (999 - 100 + 1)) + 100)+
            '-'+Math.floor((Math.random() * (9999 - 1000 + 1)) + 1000);
    }
}

const BD_Productos = new Productos();

module.exports = { BD_Productos }