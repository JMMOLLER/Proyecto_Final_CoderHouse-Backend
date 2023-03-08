const mongoose = require('mongoose');
const { MessageModel } = require('../models/MessagesModel');
const { UserModel } = require('../models/UsuariosModel');
const logger = require('../../utils/LoggerConfig');

class Mensajes {

    instance
    constructor() {
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    
    /**
     * It saves a message in the database and returns the message with the user information.
     * @param message - {
     * @returns The messageTmp object is being returned.
     */
    async newMessage(message) {
        try {
            this.mongodb(this.url);
            const newMessage = new MessageModel(message);
            await newMessage.save();
            const messageTmp = newMessage.toObject();
            const userInfo = await UserModel.findOne({ _id: messageTmp.from }).select('-password -address -phone_number -__v').lean();
            if(!userInfo){
                logger.warn('No se encontro el usuario');
                await this.deleteById(newMessage._id);
                return null;
            };
            messageTmp.from = userInfo
            return messageTmp;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    // Obtener todos los mensajes
    async getAll() {
        try {
            this.mongodb(this.url);
            const messages = await MessageModel.find().select('-__v').lean();
            return await this.setFromInfo(messages);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    /**
     * "This function is used to get all messages from a user by their email address."
     * </code>
     * @param id - the id of the user
     * @returns An array of messages.
     */
    async getByEmail(id) {
        try{
            this.mongodb(this.url);
            const messages = await MessageModel.find({from: id}).select('-__v').lean();
            return await this.setFromInfo(messages);
        }catch(err){
            logger.error(err);
            return null;
        }
    }

    /**
     * It takes an array of objects, and for each object, it searches for a user in the database, and
     * if it finds it, it adds the user to the object, and if it doesn't, it adds a default user.
     * @param doc - is an array of objects that contains the messages
     * @returns An array of objects with the following structure:
     */
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
            logger.error(err);
            return null;
        }
    }

    // Borrar un mensaje por ID
    async deleteById(id) {
        try {
            this.mongodb(this.url);
            return await MessageModel.findByIdAndDelete(id);
        } catch (err) {
            logger.error(err);
            return null;
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