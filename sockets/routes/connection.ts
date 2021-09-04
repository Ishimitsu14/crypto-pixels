import {Socket} from "socket.io";

module.exports = (io: Socket) => {
    io.on('connection', (socket: Socket) => {
        console.log(socket.id, 'connected')
        socket.emit('connection', { id: socket.id, message: 'Is Connected' })
    })
}