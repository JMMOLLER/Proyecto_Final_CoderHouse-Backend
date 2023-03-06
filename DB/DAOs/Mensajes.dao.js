const mongoose = require('mongoose');
const { MessageModel } = require('../models/MessagesModel');
const { UserModel } = require('../models/UsuariosModel');

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
            const messageTmp = newMessage.toObject();
            const userInfo = await UserModel.findOne({ _id: messageTmp.from }).select('-password -address -phone_number -__v').lean();
            messageTmp.from = userInfo
            return messageTmp;
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
            return await this.setFromInfo(messages);
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async setFromInfo(doc){
        try{
            const messages = [];
            let i = 0;
            while(doc.length>i){
                const user = await UserModel.findById(doc[i].from).select('-password -address -phone_number -__v').lean();
                if(!user){
                    doc[i].from = {
                        _id: doc[i].from,
                        name: 'Usuario anonimo',
                        avatar: '/uploads/default.png'
                    };
                    messages.push(doc[i]);
                    i++;
                    continue;
                }
                doc[i].from = user;
                messages.push(doc[i]);
                i++;
            }
            return messages;
        }catch(err){
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