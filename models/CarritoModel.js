const mongoose = require("mongoose");

const carritoSchema = new mongoose.Schema({
    timestamp: String,
    productos: Array,
});

const CarritoModel = mongoose.model('carrito', carritoSchema);

module.exports = { CarritoModel }