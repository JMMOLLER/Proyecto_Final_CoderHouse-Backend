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
            new_data['timestamp']=this.setTimestamp(new Date());
            this.mongodb(this.url);
            const newProduct = new ProductModel(new_data);
            await newProduct.save();
            return true;
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
            if(producto.id){throw new Error}
            if(producto.timestamp){throw new Error}
            if(producto.code){throw new Error}
            if(!producto.tittle){throw new Error}
            if(!producto.description){throw new Error}
            if(!producto.thumbnail){throw new Error}
            if(!producto.price){throw new Error}
            if(!producto.stock){throw new Error}
            return true;
        }catch(e){
            if(e!='Error'){this.log(e)};
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

    log(e){
        let date = new Date();
        let current_time = date.getHours()+":"+date.getMinutes()+":"+ date.getSeconds();
        fs.appendFileSync("log.txt", "\n\n"+current_time.toString()+"\n");
        fs.appendFileSync("log.txt", e.toString());
    }
}

const BD_Productos = new Productos();

module.exports = { BD_Productos }