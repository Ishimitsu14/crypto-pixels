import redis, {RedisClient} from "redis";
import {UploadedFile} from "express-fileupload";
import NotificationService from "./NotificationService";

class UploadService {
    private readonly channel = 'resize'
    private readonly file: UploadedFile
    private readonly path: string

    constructor(file: UploadedFile, path: string) {
        this.file = file
        this.path = path
    }

    upload(width: string, height: string): Promise<string> {
        const client = redis.createClient()
        return new Promise((resolve, reject) => {
            const uploadPath = `${this.path}/${this.file.name}`
            this.file.mv(uploadPath,  (err) => {
                if (err) {
                    reject(err.message)
                }
                client.publish(
                    `${this.channel}:start`,
                    JSON.stringify({ width, height, zip: this.file.name }),
                    () => client.quit()
                )
                this.onUploadEnd()
                resolve('Archive uploaded, await notification')
            })
        })
    }

    onUploadEnd() {
        const subscriber = redis.createClient()
        subscriber.on('message', async (channel: string) => {
            if (channel === `${this.channel}:end`) {
                const notificationService = new NotificationService()
                await notificationService.publishMessage(
                    'Archive unpacked successfully',
                    notificationService.types.SUCCESS,
                )
                subscriber.quit()
            }
        })
        subscriber.subscribe(`${this.channel}:end`)
    }
}

export = UploadService