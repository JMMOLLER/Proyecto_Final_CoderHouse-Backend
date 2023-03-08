const mongoose = require("mongoose");
const { UserModel } = require("../models/UsuariosModel");
const { OrderModel } = require("../models/OrdernesModel");
const { CarritoModel } = require("../models/CarritoModel");
const { validatePhoneE164 } = require("../../Routers/Services/API.service");
const logger = require("../../utils/LoggerConfig");
mongoose.set("strictQuery", true);

class UsuariosDAO {
    /**
     * It connects to the database.
     */
    constructor() {
        this.url = process.env.MONGODB_URI;
        this.mongodb = mongoose.connect;
    }

    /**
     * It connects to the database, then it returns all the documents in the collection.
     * @returns The result of the query.
     */
    async getAll() {
        try {
            this.mongodb(this.url);
            const data = await UserModel.find().select("-__v").lean();
            return data;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    /**
     * It connects to the database, then it searches for a document with the given id, if it doesn't
     * find it, it throws an error, if it finds it, it returns the document.
     * @param id - The id of the document to be retrieved.
     * @returns The document with the id that was passed as a parameter.
     */
    async getById(id) {
        try {
            this.mongodb(this.url);
            const doc = await UserModel.findById(id).select("-password -__v");

            if (!doc) {
                logger.warn("No se encontro el usuario");
                return false;
            }

            return doc;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async getByEmail(email) {
        try {
            this.mongodb(this.url);
            const user = await UserModel.findOne({ email: email });

            if (!user) {
                logger.warn("No se encontro el usuario");
                return false;
            }

            return user;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async updateUser(id, data) {
        try {
            this.mongodb(this.url);
            const user = await this.getById(id);

            if (!user) {
                logger.warn("No se encontro el usuario");
                return false;
            }

            if (data.age) {
                user.age = data.age;
            }
            if (data.address) {
                user.address = data.address;
            }
            if (data.phone_number) {
                user.phone_number = data.phone_number;
            }
            if (data.avatar) {
                user.avatar = data.avatar;
            }

            await user.save();

            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    /**
     * It checks if the email is already in the database.
     * @param email - email
     * @returns A promise.
     */
    async checkEmail(email) {
        try {
            this.mongodb(this.url);
            const doc = await UserModel.findOne({ email: email });
            if (doc) {
                logger.warn("Email no disponible");
                return false;
            }
            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    /**
     * It creates a new carrito (cart) in the database.
     * @returns The newAuthor object is being returned.
     */
    async createUser(data) {
        try {
            this.mongodb(this.url);

            if (!(await this.checkEmail(data.email))) {
                return { status: false };
            }

            const newAuthor = new UserModel(data);
            await newAuthor.save();
            return {
                id: newAuthor._id,
                status: true,
            };
        } catch (err) {
            logger.error(err);
            return { status: false };
        }
    }

    async getAvatar(id) {
        try {
            this.mongodb(this.url);
            const doc = await UserModel.findById(id).lean();
            if (!doc) {
                logger.warn("No se encontro el usuario");
                return false;
            }
            return doc.avatar;
        } catch (err) {
            logger.error(err);
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
        try {
            this.mongodb(this.url);
            const user = await UserModel.findByIdAndDelete(id).select(
                "-password -__v"
            );

            if (!user) {
                logger.warn("No se encontro el usuario");
                return false;
            }

            await CarritoModel.deleteMany({ owner: id });
            await OrderModel.deleteMany({ user: id });
            return user;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    async completeRegister(data) {
        try {
            this.mongodb(this.url);

            if (!data.userid) {

                logger.warn("userid es requerido");
                return { msg: "userid is required", status: 400, value: false };

            }if (!data.email) {

                logger.warn("email es requerido");
                return { msg: "email is required", status: 400, value: false };

            }if (!data.address) {

                logger.warn("address es requerido");
                return {
                    msg: "address is required",
                    status: 400,
                    value: false,
                };

            }if (!data.age) {

                logger.warn("age es requerido");
                return { msg: "age is required", status: 400, value: false };

            }if (!data.phone_number) {

                logger.warn("phone_number es requerido");
                return {
                    msg: "phone_number is required",
                    status: 400,
                    value: false,
                };

            }if (!validatePhoneE164(data.phone_number)) {

                logger.warn("phone_number no es valido");
                return {
                    msg: "phone_number is not valid",
                    status: 400,
                    value: false,
                };

            }if (!(await this.checkEmail(data.email))) {

                logger.warn("email ya existe");
                return {
                    msg: "email already exist",
                    status: 409,
                    value: false,
                };

            }

            let user = await UserModel.findById(data.userid);

            if (!user) {

                logger.warn("user no encontrado");
                return { msg: "user not found", status: 404, value: false };

            }if (user.__v >= 1) {

                logger.warn("registro de usuario ya completo");
                return {
                    msg: "user already complete",
                    status: 409,
                    value: false,
                };

            }

            user.email = data.email;
            user.address = data.address;
            user.age = data.age;
            user.phone_number = data.phone_number;
            user.__v = 1;

            await user.save();
            return {
                msg: "Usuario actualizado",
                status: 200,
                value: true,
                user,
            };
        } catch (error) {
            logger.error(error);
            return { msg: error.message, status: 500, value: false };
        }
    }
}

const BD_Usuarios_Local = new UsuariosDAO();

module.exports = { BD_Usuarios_Local };
