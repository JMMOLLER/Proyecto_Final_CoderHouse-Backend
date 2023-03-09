const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    from: { type: mongoose.Types.ObjectId, required: true, reference: 'usuarios' },
    replyTo: { type: mongoose.Types.ObjectId, reference: 'mensajes' },
    timestamp: { type: Date, default: Date.now }
});

const MessageModel = mongoose.model('mensajes', messageSchema)

module.exports = { MessageModel }