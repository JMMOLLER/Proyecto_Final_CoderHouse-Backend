const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: String,
    age: String,
    phone_number: String,
    avatar: String,
});

const UserModel = mongoose.model('usuarios', usersSchema);

module.exports = { UserModel }