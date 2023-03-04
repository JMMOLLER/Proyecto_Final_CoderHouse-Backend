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
            this.mongodb(this.url);
            new_data['code']=this.generateCode();
            const newProduct = new ProductModel(new_data);
            return await newProduct.save();
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async checkStock({product_id, cant, user_cart}){
        const response = {value:false, status:500};
        try{
            const data_to_check = await this.getById(product_id);
            if(!data_to_check){
                response.status = 404;
                response.message = 'ID product no found';
                return response;
            };
            if(cant=="++"){
                user_cart.productos.forEach(element => {
                    if(element.id==product_id){
                        cant=element.quantity+1;
                    }
                });//Busco la cantidad de productos que ya tiene el usuario en el carrito y le suma 1
                if(cant=="++"){cant=1};//Si no tiene ningun producto en el carrito, le asigna 1
            }
            if(data_to_check.stock>=cant){
                response.value = true;
                response.message = "Stock OK";
                return response
            };//Si hay stock suficiente, devuelve true
            response.message = "Stock insuficiente";
            response.status = 409;
            return response;
        }catch(err){
            response.message = err.message;
            console.log(err);
            return response;
        }
    }

    async updateProduct(update, id_producto){
        try{
            this.mongodb(this.url);

            const data_to_update = this.getById(id_producto);
            if(!data_to_update){throw new Error('ID producto not exists')};

            update['timestamp']=new Date().toISOString();
            await ProductModel.findByIdAndUpdate(id_producto,update);
            return update;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async deleteByID(id) {
        try{
            this.mongodb(this.url);
            return await ProductModel.findByIdAndDelete(id);
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
            if(!producto.title){throw new Error('title is required')}
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

    generateCode(){
        return Math.floor((Math.random() * (99 - 10 + 1)) + 10)+
            '-'+Math.floor((Math.random() * (999 - 100 + 1)) + 100)+
            '-'+Math.floor((Math.random() * (9999 - 1000 + 1)) + 1000);
    }
}

const BD_Productos = new Productos();

module.exports = { BD_Productos }