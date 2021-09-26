import redis from "redis";
import fs from 'fs';
import appRoot from "app-root-path";
import NotificationService from "./NotificationService";
import {getAsyncRedis} from "../functions";
import {IProductInfo} from "../types/TProduct";

class RarityService {
    private static readonly key: string = 'rarity';

    constructor() {
       try {
           let info: any[] = [];
           const client = redis.createClient()
           fs.readdir(`${appRoot.path}/assets`, (err, dirs) => {
               if (err) {
                   throw Error(err.message)
               }
               dirs.forEach((dir) => {
                   const subDirs = fs.readdirSync(`${appRoot.path}/assets/${dir}`)
                   subDirs.forEach((el) => {
                       if (el.indexOf('.json') >= 0) {
                           info = [
                               ...info,
                               ...JSON.parse(fs.readFileSync(`${appRoot.path}/assets/${dir}/${el}`, 'utf8'))
                           ]
                       }
                   })
               })
               if (info) {
                   client.set(RarityService.key, JSON.stringify(info), () => client.quit())
               }
           })
       } catch (e: any) {
           this.catchError(e)
       }
    }

    static async getRarity(): Promise<IProductInfo[]> {
        const client = redis.createClient()
        const rarity = await getAsyncRedis(client, RarityService.key)
        if (rarity) {
            return JSON.parse(rarity)
        }
        return []
    }

    async catchError(e: any) {
        const subscriber = redis.createClient()
        const notificationService = new NotificationService()
        await notificationService.publishMessage(
            e.message,
            notificationService.types.ERROR,
        )
        subscriber.quit()
    }
}

export = RarityService