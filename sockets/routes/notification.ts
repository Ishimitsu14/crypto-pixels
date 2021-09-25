import {Socket} from "socket.io"
import NotificationService from '../../services/NotificationService'

module.exports = (io: Socket) => {
    const notificationService = new NotificationService()
    notificationService.subscribe(async () => {
        const messages = await notificationService.getMessages()
        console.log(messages)
        io.emit('notification', messages)
        notificationService.cleanMessages()
    })
}