const mongoose = require("mongoose");
const { OrderModel } = require("../models/OrdernesModel");
const { ProductModel } = require("../models/ProductsModel");
const { UserModel } = require("../models/UsuariosModel");
const logger = require("../../utils/LoggerConfig");

class Ordenes {
    constructor() {
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    async getAll() {
        try {
            this.mongodb(this.url);
            const doc = await OrderModel.find().select("-__v");
            return await this.normalizeData(doc);
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    /**
     * It gets all the orders of a user.
     * @param userId - The user id that is passed to the function
     * @returns An object with the following properties:
     */
    async getAllByUser(userId) {
        try {
            this.mongodb(this.url);
            const doc = await OrderModel.find({ user: userId }).select("-__v");

            if (doc.length == 0) {
                logger.warn("No se encontraron ordenes de el usuario");
                return {
                    value: true,
                    message: "Orders not found",
                    status: 200,
                };
            }

            const orders = await this.normalizeData(doc);

            return {
                orders,
                value: true,
                message: "Orders found successfully",
                status: 200,
            };
        } catch (err) {
            logger.error(err);
            return {
                value: false,
                message: e.messag,
                status: 500,
                value: false,
            };
        }
    }

    /**
     * It connects to the database, searches for a document with the given code, and returns it.
     * @param code - String
     * @returns An object with the following properties:
     */
    async getByCode(code) {
        try {
            this.mongodb(this.url);
            const doc = await OrderModel.findOne({ code: code }).select("-__v");

            if (!doc) {
                logger.warn("No se encontro la orden");
                return {
                    value: false,
                    message: "Order not found",
                    status: 404,
                };
            }

            const order = await this.normalizeData([doc]);
            return {
                order: order[0],
                value: true,
                message: "Order found successfully",
            };
        } catch (err) {
            logger.error(err);
            return { value: false, message: e.message, status: 500 };
        }
    }

    /**
     * It takes an array of orders, and for each order, it takes the user id and finds the user in the
     * database, then it takes the products array and for each product, it finds the product in the
     * database and adds the quantity to the product object, then it adds the products array to the
     * order object, and finally it adds the order to the orders array.
     * </code>
     * @param data - Array of orders
     * @returns An array of orders with the user and products information.
     */
    async normalizeData(data) {
        try {
            this.mongodb(this.url);
            const orders = [];
            for (const order of data) {
                const user = await UserModel.findOne({ _id: order.user })
                    .select("-__v")
                    .lean();
                order._doc.user = user;
                const products = [];
                for (const productOrder of order.products) {
                    const product = await ProductModel.findOne({
                        _id: productOrder.id,
                    })
                        .select("-__v")
                        .lean(); //obtenemos la info del producto
                    product.quantity = productOrder.quantity; //agregamos la cantidad de productos al array de productos
                    products.push(product); //agregamos el producto al array de productos
                }
                order._doc.products = products; //agregamos el array de productos al objeto de la orden
                orders.push(order); //agregamos la orden al array de ordenes
            }
            return orders;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    /**
     * It adds a new order to the database.
     * </code>
     * @returns an object with the following properties:
     * newOrder: order[0],
     * value: true,
     * message: "Order created successfully",
     */
    async addNewOrder({ userId, cartInfo, shipping }) {
        try {
            this.mongodb(this.url);
            const fecha = new Date();
            const new_data = {};

            new_data["code"] = this.generateCode();
            new_data["date"] =
                fecha.toLocaleString("default", { month: "long" }) +
                " " +
                fecha.getDate() +
                ", " +
                fecha.getFullYear();
            new_data["user"] = userId;
            new_data["products"] = cartInfo.productos;
            new_data["totalItems"] = this.getTotalItems(cartInfo.productos);
            new_data["subTotal"] = Number(
                await this.calculateSubTotal(cartInfo.productos)
            );
            new_data["shipping"] = shipping;
            new_data["total"] = new_data["subTotal"] + new_data["shipping"];

            if (shipping == 10){
                new_data["shippingMethod"] = "Envío a domicilio Express";
            }else if (shipping == 5){
                new_data["shippingMethod"] = "Envío a domicilio";
            }else{
                new_data["shippingMethod"] = "Retiro en sucursal";
            }

            const newProduct = new OrderModel(new_data);
            const doc = await newProduct.save();
            const order = await this.normalizeData([doc]);
            return {
                newOrder: order[0],
                value: true,
                message: "Order created successfully",
            };
        } catch (err) {
            logger.error(err);
            return { value: false, message: err.message };
        }
    }

    /**
     * It loops through an array of objects, and adds the quantity property of each object to a
     * totalItems variable.
     * @param products - An array of objects that contain the product information.
     * @returns The total number of items in the cart.
     */
    getTotalItems(products) {
        try{
            let totalItems = 0;
            for (const product of products) {
                totalItems += product.quantity;
            }
            return totalItems;
        }catch(err){
            logger.error(err);
            return false;
        }
    }

    /**
     * It connects to a MongoDB database, gets the price and quantity of each product, and returns the
     * total price of all products.
     * @param products - [{id: '5d9f1140f10a81216cfd4408', quantity: 1}, {id:
     * '5d9f1159f81ce8d1ef2bee48', quantity: 1}]
     * @returns The total price of the products.
     */
    async calculateSubTotal(products) {
        try {
            this.mongodb(this.url);
            const productsInfo = await this.getInfoProducts(products);
            const total = Number(
                productsInfo.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                )
            );
            return total.toFixed(2);
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    /**
     * It takes an array of objects, each object has an id and a quantity, it then queries the database
     * for each id and returns an array of objects with the id, quantity and other information about
     * the product.
     * @param products - [{id: "5e9f8f8f8f8f8f8f8f8f8f8f", quantity: 1}, {id: "5e9f8f8f8f8f8f8f8f8f8f
     * @returns An array of objects.
     */
    async getInfoProducts(products) {
        try {
            this.mongodb(this.url);
            const productsInfo = [];
            for (const product of products) {
                const productInfo = await ProductModel.findById({
                    _id: product.id,
                })
                    .select("-__v")
                    .lean();
                productInfo["quantity"] = product.quantity;
                productsInfo.push(productInfo);
            }
            return productsInfo;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    /**
     * It generates a random number between 10 and 99, then adds a dash, then generates a random number
     * between 100 and 999, then adds a dash, then generates a random number between 1000 and 9999.
     * @returns A string of numbers separated by dashes.
     */
    generateCode() {
        return (
            Math.floor(Math.random() * (99 - 10 + 1) + 10) +
            "-" +
            Math.floor(Math.random() * (999 - 100 + 1) + 100) +
            "-" +
            Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
        );
    }
}

const BD_Ordenes = new Ordenes();

module.exports = { BD_Ordenes };
