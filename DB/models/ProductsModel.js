const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    brand: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    code: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
});

const ProductModel = mongoose.model('producto', productSchema);

module.exports = { ProductModel }