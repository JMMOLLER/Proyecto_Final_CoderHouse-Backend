const mongoose = require("mongoose");
const { Author_Local_Model } = require("../models/UsuariosModel");

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
            const data = await Author_Local_Model.find().lean();
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
            await this.mongodb(this.url);
            const doc = await Author_Local_Model.findById(id).lean();
            if(doc==null){return false;}
            return doc;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async checkEmail(email){
        await this.mongodb(this.url);
        const doc = await Author_Local_Model.findOne({email: email})
        if(doc==null){return true}
        else{return false};
    }

    /**
     * It creates a new carrito (cart) in the database.
     * @returns The newAuthor object is being returned.
     */
    async createAuthor(data){
        try{
            await this.mongodb(this.url);
            if(await this.checkEmail(data.email)){
                const newAuthor = new Author_Local_Model(data);
                newAuthor.Timestamp = this.setTimestamp(new Date());
                await newAuthor.save();
                return true;
            }else{
                throw new Error('Email no disponible')
            }
        }catch(err){
            console.log(err);
            return false;
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
            await this.mongodb(this.url);
            await Author_Local_Model.findByIdAndDelete(id);
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async login(credentials){
        try{
            const username = credentials.username;
            await this.mongodb(this.url);
            const doc = await Author_Local_Model.findOne({nickname: username}).lean();
            if(doc==null){return {status: false}}
            if(doc.password != credentials.password){return {status: false}}
            return {status: true, ID: doc._id};
        }catch(err){
            console.log(err);
            return false;
        }
    }

    /**
     * It takes a date object and returns a string in the format dd/mm/yyyy.
     * @param date - The date object to be formatted.
     * @returns The date in the format dd/mm/yyyy
     */
    setTimestamp(date) {
        return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
    }
}

const BD_Autores_Local = new Autores();

module.exports = { BD_Autores_Local };