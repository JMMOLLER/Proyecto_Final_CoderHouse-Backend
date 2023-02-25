const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: String,
    age: String,
    phone_number: String,
    avatar: String,
});

usersSchema.pre('save', function(next) {
    const hash = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10), null);
    this.password = hash;
    next();
});

usersSchema.methods.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};

const UserModel = mongoose.model('usuarios', usersSchema);

module.exports = { UserModel }