const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const carritoSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    owner: { type: ObjectId, ref: 'usuarios' },
    productos: [{
        id: { type: ObjectId, required: true, ref: 'productos' },
        quantity: { type: Number, default: 1 }
    }]
});

const CarritoModel = mongoose.model('carrito', carritoSchema);

module.exports = { CarritoModel }