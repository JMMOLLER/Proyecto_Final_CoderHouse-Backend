const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const carritoSchema = new mongoose.Schema({
    timestamp: String,
    productos: Array,
    owner: String
});

const CarritoModel = mongoose.model('carrito', carritoSchema);

module.exports = { CarritoModel }