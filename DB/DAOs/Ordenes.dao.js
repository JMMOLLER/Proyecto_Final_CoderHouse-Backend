const mongoose = require("mongoose");
const { OrderModel } = require("../models/OrdernesModel");
const { ProductModel } = require("../models/ProductsModel");
const { UserModel } = require("../models/UsuariosModel");

class Ordenes {
    
    constructor(){
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    async getAll(){
        try{
            this.mongodb(this.url);
            const doc = await OrderModel.find().select('-__v');
            return await this.normalizeData(doc);
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getAllByUser(userId){
        try{
            this.mongodb(this.url);
            const doc = await OrderModel.find({user:userId}).select('-__v');
            if(!doc) return {value: false, message: 'Orders not found', status: 404};
            if(doc.length == 0) return {value: true, message: 'Orders not found', status: 200};
            const orders = await this.normalizeData(doc);

            return {orders, value: true, message: 'Orders found successfully', status: 200};
        }catch(err){
            console.log(err);
            return {value: false, message: e.messag, status: 500, value: false};
        }
    }

    async getByCode(code){
        try{
            this.mongodb(this.url);
            const doc = await OrderModel.findOne({code:code}).select('-__v');
            if(!doc) return {value: false, message: 'Order not found', status: 404};
            const order = await this.normalizeData([doc]);
            return {order:order[0], value: true, message: 'Order found successfully'};
        }catch(err){
            console.log(err);
            return {value: false, message: e.message, status: 500};
        }
    }

    async normalizeData(data){
        try{
            this.mongodb(this.url);
            const orders = [];
            for(const order of data){
                const user = await UserModel.findOne({_id:order.user}).select('-__v').lean();
                order._doc.user = user;
                const products = [];
                for(const productOrder of order.products){
                    const product = await ProductModel.findOne({_id:productOrder.id}).select('-__v').lean();//obtenemos la info del producto
                    product.quantity = productOrder.quantity;//agregamos la cantidad de productos al array de productos
                    products.push(product);//agregamos el producto al array de productos
                }
                order._doc.products = products;//agregamos el array de productos al objeto de la orden
                orders.push(order);//agregamos la orden al array de ordenes
            }
            return orders;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async addNewOrder({userId, cartInfo, shipping}){
        try{
            this.mongodb(this.url);
            const fecha = new Date();
            const new_data = {};

            new_data['code']=this.generateCode();
            new_data['date'] = fecha.toLocaleString('default', { month: 'long' })+" "+fecha.getDate()+", "+fecha.getFullYear();
            new_data['user'] = userId;
            new_data['products'] = cartInfo.productos;
            new_data['totalItems'] = this.getTotalItems(cartInfo.productos);
            new_data['subTotal'] = Number(await this.calculateSubTotal(cartInfo.productos));
            new_data['shipping'] = shipping;
            new_data['total'] = new_data['subTotal'] + new_data['shipping'];
            if(shipping == 10) new_data['shippingMethod'] = "Envío a domicilio Express";
            else if(shipping == 5) new_data['shippingMethod'] = "Envío a domicilio";
            else new_data['shippingMethod'] = "Retiro en sucursal";

            const newProduct = new OrderModel(new_data);
            const doc = await newProduct.save();
            const order = await this.normalizeData([doc]);
            return {newOrder:order[0], value: true, message: 'Order created successfully'};
        }catch(err){
            console.log(err);
            return {value: false, message: err.message};
        }
    }

    getTotalItems(products){
        let totalItems = 0;
        for(const product of products){
            totalItems += product.quantity;
        }
        return totalItems;
    }

    async calculateSubTotal(products){
        try{
            this.mongodb(this.url);
            const productsInfo = await this.getInfoProducts(products);
            const total = Number(productsInfo.reduce((acc, item) => acc +( item.price * item.quantity), 0));
            return total.toFixed(2);
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getInfoProducts(products){
        try{
            this.mongodb(this.url);
            const productsInfo = [];
            for (const product of products) {
                const productInfo = await ProductModel.findById({_id:product.id}).select('-__v').lean();
                productInfo['quantity'] = product.quantity;
                productsInfo.push(productInfo);
            }
            return productsInfo;
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

const BD_Ordenes = new Ordenes();

module.exports = { BD_Ordenes }