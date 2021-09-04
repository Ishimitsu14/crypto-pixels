import {Socket} from "socket.io";
import events from "events";

module.exports = (io: Socket) => {
    const em = new events.EventEmitter()
    em.on('notification', (message) => {
        console.log(message)
        io.emit('notification', { message })
    })
}