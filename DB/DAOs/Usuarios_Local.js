const mongoose = require("mongoose");
const { UserModel } = require("../models/UsuariosModel");
mongoose.set('strictQuery', true);

class Autores{

    /**
     * It connects to the database.
     */
    constructor(){
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    /**
     * It connects to the database, then it returns all the documents in the collection.
     * @returns The result of the query.
     */
    async getAll(){
        try{
            this.mongodb(this.url);
            const data = await UserModel.find().lean();
            return data;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    /**
     * It connects to the database, then it searches for a document with the given id, if it doesn't
     * find it, it throws an error, if it finds it, it returns the document.
     * @param id - The id of the document to be retrieved.
     * @returns The document with the id that was passed as a parameter.
     */
    async getById(id){
        try{
            this.mongodb(this.url);
            const doc = await UserModel.findById(id).lean();
            if(doc==null){return false;}
            return doc;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    /**
     * It checks if the email is already in the database.
     * @param email - email
     * @returns A promise.
     */
    async checkEmail(email){
        this.mongodb(this.url);
        const doc = await UserModel.findOne({email: email})
        if(doc==null){return true}
        else{return false};
    }

    /**
     * It creates a new carrito (cart) in the database.
     * @returns The newAuthor object is being returned.
     */
    async createUser(data){
        try{
            this.mongodb(this.url);
            if(await this.checkEmail(data.email)){
                const newAuthor = new UserModel(data);
                await newAuthor.save();
                return {id: newAuthor._id, status: true};
            }else{
                throw new Error('Email no disponible')
            }
        }catch(err){
            console.log(err);
            return {status: false};
        }
    }

    /**
     * It deletes a row from a JSON file
     * @param id - The id of the cart to be deleted
     * @returns an array with two elements. The first element is a boolean that indicates if the
     * operation was successful or not. The second element is the error message if the operation was
     * not successful.
     */
    async deleteByID(id) {
        try{
            this.mongodb(this.url);
            await UserModel.findByIdAndDelete(id);
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
}

const BD_Autores_Local = new Autores();

module.exports = { BD_Autores_Local };