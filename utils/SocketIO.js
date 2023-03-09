const { Server: IOServer } = require('socket.io');
const { Mensajes } = require('../DB/DAOs/Mensajes.dao');
const DB = new Mensajes().returnSingleton();

module.exports = {
    socket: (httpServer) => {
        const io = new IOServer(httpServer);
        io.on("connection", async (socket) => {
            console.log('\x1b[33m%s\x1b[0m', "UN USUARIO SE HA CONECTADO");
            socket.emit('messages', await DB.getAll());

            socket.on('new-message', async (data) => {
                const newMessage = await DB.newMessage(data);
                io.sockets.emit('messages', [newMessage]);
            });

            socket.on('messages', async () => {
                const messages = await DB.getAll();
                io.sockets.emit('messages', messages);
            });
        });
    }
};