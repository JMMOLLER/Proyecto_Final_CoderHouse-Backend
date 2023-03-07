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
            return await ProductModel.find().select('-__v');
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getById(id){
        try{
            this.mongodb(this.url);
            return await ProductModel.findById(id).select('-__v').lean();
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

    async getByCategory(category){
        try{
            this.mongodb(this.url);
            const products = await ProductModel.find({category:category}).select('-__v');
            if(!products){return {status: 404, msg: 'Category not found', value: false}}
            return {status: 200, msg: 'Category found', value: true, products};
        }catch(err){
            console.log(err);
            return {status: 500, msg: err.message, value: false};
        }
    }

    async checkStock({product_id, cant, user_cart}){
        const response = {value:false, status:500};
        try{
            const data_to_check = await this.getById(product_id);
            cant = parseInt(cant) || "++";
            let current_cant = 0;
            if(!data_to_check){
                response.status = 404;
                response.message = 'ID product no found';
                return response;
            };
            for(const element of user_cart.productos){
                if(element.id==product_id){
                    current_cant=element.quantity;
                }
            };//Busco la cantidad de productos que ya tiene el usuario en el carrito y le suma 1
            if(cant=="++"){
                cant=current_cant+1;
                if(current_cant==0){cant=1};//Si no tiene ningun producto con el id recibido en el carrito, le asigna 1
            }else{
                cant=current_cant+cant;
            }
            if(data_to_check.stock>=cant){
                response.value = true;
                response.message = "Stock OK";
                return response
            };//Si hay stock suficiente, devuelve true
            response.message = "Stock is not enough";
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
            if(!producto.category){throw new Error('category is required')}
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