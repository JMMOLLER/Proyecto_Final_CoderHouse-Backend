const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usersSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true },
    phone_number: { type: String, required: true },
    avatar: { type: String, required: true },
    twitterId: { type: String, required: false },
    githubId: { type: String, required: false },
});

usersSchema.pre('save', function(next) {
    if(!this.isModified('password')) return next();
    const hash = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10), null);
    this.password = hash;
    next();
});

usersSchema.methods.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};

const UserModel = mongoose.model('usuarios', usersSchema);

module.exports = { UserModel }