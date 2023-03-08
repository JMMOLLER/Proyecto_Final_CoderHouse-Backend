const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const orderSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    subTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    shipping: { type: Number, required: true },
    shippingMethod: { type: String, required: true },
    date: { type: String, required: true },
    user: { type: ObjectId, required: true, reference: "usuarios" },
    products: [{
        id: { type: ObjectId, required: true, reference: "productos" },
        quantity: { type: Number, default: 1 }
    }],
});

const OrderModel = mongoose.model('ordenes', orderSchema);

module.exports = { OrderModel }