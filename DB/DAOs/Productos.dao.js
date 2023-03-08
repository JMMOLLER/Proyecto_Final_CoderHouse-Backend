const mongoose = require("mongoose");
const { ProductModel } = require("../models/ProductsModel");
const logger = require("../../utils/LoggerConfig");

class Productos {
    constructor() {
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    async getAll() {
        try {
            this.mongodb(this.url);
            return await ProductModel.find().select("-__v");
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async getById(id) {
        try {
            this.mongodb(this.url);
            const product = await ProductModel.findById(id)
                .select("-__v")
                .lean();

            if (!product) {
                logger.warn("No se encontro el producto");
                return false;
            }

            return product;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async setProduct(new_data) {
        try {
            this.mongodb(this.url);

            new_data["code"] = this.generateCode();
            const newProduct = new ProductModel(new_data);
            return await newProduct.save();
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async getByCategory(category) {
        try {
            this.mongodb(this.url);

            const products = await ProductModel.find({
                category: category,
            }).select("-__v");

            if (!products) {
                logger.warn(
                    "No se encontro productos con la categoria indicada"
                );
                return { status: 404, msg: "Category not found", value: false };
            }

            return {
                status: 200,
                msg: "Category found",
                value: true,
                products,
            };
        } catch (err) {
            logger.error(err);
            return { status: 500, msg: err.message, value: false };
        }
    }

    async checkStock({ product_id, cant, user_cart }) {
        try {
            const data_to_check = await this.getById(product_id);
            cant = parseInt(cant) || "++";
            let current_cant = 0;

            if (!data_to_check) {
                logger.warn("No se encontro el producto");
                return {
                    value: false,
                    status: 404,
                    message: "ID product no found",
                };
            }

            for (const element of user_cart.productos) {
                if (element.id == product_id) {
                    current_cant = element.quantity;
                }
            } //Busco la cantidad de productos que ya tiene el usuario en el carrito y le suma 1

            if (cant == "++") {
                cant = current_cant + 1;
                if (current_cant == 0) {
                    cant = 1;
                } //Si no tiene ningun producto con el id recibido en el carrito, le asigna 1
            } else {
                cant = current_cant + cant;
            }

            if (data_to_check.stock >= cant) {
                return { value: true, status: 200, message: "Stock OK" };
            } //Si hay stock suficiente, devuelve true

            logger.warn(
                "El stock no es suficiente para el producto solicitado"
            );

            return {
                value: false,
                status: 409,
                message: "Stock is not enough",
            };
        } catch (err) {
            logger.error(err);
            return { value: false, status: 500, message: err.message };
        }
    }

    async updateProduct(update, id_producto) {
        try {
            this.mongodb(this.url);

            const data_to_update = this.getById(id_producto);

            if (!data_to_update) {
                logger.warn("No se encontro el producto");
                return false;
            }

            update["timestamp"] = new Date().toISOString();
            await ProductModel.findByIdAndUpdate(id_producto, update);
            return update;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async deleteByID(id) {
        try {
            this.mongodb(this.url);
            const product = await ProductModel.findByIdAndDelete(id);

            if (!product) {
                logger.warn("No se encontro el producto a eliminar");
                return false;
            }

            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    validateProduct(producto) {
        try {
            if (producto.id) {

                logger.warn("id es auto generado");
                throw new Error("id is auto generated");

            }if (producto.timestamp) {

                logger.warn("timestamp es auto generado");
                throw new Error("timestamp is auto generated");

            }if (producto.code) {

                logger.warn("code es auto generado");
                throw new Error("code is auto generated");

            }if (!producto.category) {

                logger.warn("category es requerido");
                throw new Error("category is required");

            }if (!producto.title) {

                logger.warn("title es requerido");
                throw new Error("title is required");

            }if (!producto.brand) {

                logger.warn("brand es requerido");
                throw new Error("brand is required");

            }if (!producto.thumbnail) {

                logger.warn("thumbnail es requerido");
                throw new Error("thumbnail is required");

            }if (!producto.price) {

                logger.warn("price es requerido");
                throw new Error("price is required");

            }if (!producto.stock) {

                logger.warn("stock es requerido");
                throw new Error("stock is required");

            }
            
            return true;
        } catch (e) {
            logger.error(e);
            return false;
        }
    }

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

const BD_Productos = new Productos();

module.exports = { BD_Productos };
