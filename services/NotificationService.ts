import redis from "redis";
import {getAsyncRedis} from "../functions";
import { v4 as uuid } from 'uuid';

class NotificationService {
    readonly types = {
        NOTIFY: 'notify',
        SUCCESS: 'success',
        ERROR: 'error',
    }
    private readonly channel = 'notification'
    private readonly key = 'notifications'

    constructor() {
    }

    async publishMessage(message: string, type: string) {
        const client = redis.createClient()
        let messages = []
        const msgString = await getAsyncRedis(client, this.key)
        if (msgString) {
            messages = JSON.parse(msgString)
        }
        messages.push({ type, message, uuid: uuid() })
        client.set(this.key, JSON.stringify(messages))
        client.publish('notification', '', () => client.quit())
    }

    async getMessages () {
        const client = redis.createClient()
        const messages = await getAsyncRedis(client, this.key)
        client.quit()
        return messages
    }

    subscribe(callback: Function) {
        const subscriber = redis.createClient()
        subscriber.on('message', async (channel: string) => {
            if (channel === this.channel) {
                callback()
            }
        })
        subscriber.subscribe(this.channel)
    }

    cleanMessages() {
        const client = redis.createClient()
        client.set(this.key, JSON.stringify([]), () => client.quit())
    }
}

export = NotificationService