const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    timestamp: String,
    code: String,
    thumbnail: String,
    price: String,
    stock: Number,
});

const ProductModel = mongoose.model('producto', productSchema);

module.exports = { ProductModel }