const mongoose = require('mongoose');
const { MessageModel } = require('../models/MessagesModel');

class Mensajes {

    instance
    constructor() {
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    // Crear un nuevo mensaje en la BD
    async newMessage(message) {
        try {
            this.mongodb(this.url);
            const newMessage = new MessageModel(message);
            await newMessage.save();
            return newMessage;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // Obtener todos los mensajes
    async getAll() {
        try {
            console.log('leyendo mensajes en mongo');
            this.mongodb(this.url);
            const messages = await MessageModel.find().lean();
            return messages;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    // Borrar un mensaje por ID
    async deleteById(id) {
        try {
            this.mongodb(this.url);
            return await MessageModel.findByIdAndDelete(id);
        } catch (err) {
            throw { error: 'No existen productos' };
        }
    }

    returnSingleton() {
        if (!this.instance) {
            this.instance = new Mensajes();
        }
        return this.instance;
    }
}


module.exports =  { Mensajes };