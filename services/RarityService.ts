import redis from "redis";
import fs from 'fs';
import appRoot from "app-root-path";
import NotificationService from "./NotificationService";
import {connect, getAsyncRedis} from "../functions";
import {IProductRarity} from "../types/TProduct";
import {Product} from "../models/Product";
import {v4 as uuidv4} from "uuid";

class RarityService {
    private readonly key: string = 'rarity';
    public rarities: { name: string, rarity: string }[];

    constructor() {
       try {
           let info: { name: string, rarity: string }[] = [];
           fs.readdir(`${appRoot.path}/assets`, (err, dirs) => {
               if (err) {
                   throw Error(err.message)
               }
               dirs.forEach((dir) => {
                   const subDirs = fs.readdirSync(`${appRoot.path}/assets/${dir}`)
                   subDirs.forEach((el) => {
                       if (el.indexOf('.json') >= 0) {
                           const newInfo = JSON.parse(
                               fs.readFileSync(`${appRoot.path}/assets/${dir}/${el}`, 'utf8')
                           ).map((el: any) => ({ name: el.name, rarity: el.rarity }))
                           info = [
                               ...info,
                               ...newInfo
                           ]
                       }
                   })
               })
               if (info) {
                   this.rarities = info
               }
           })
       } catch (e: any) {
           this.catchError(e)
       }
    }

    public async getRarities(): Promise<IProductRarity[]> {
        const stats: IProductRarity[] = [];
        try {
            await connect();
            const products = await Product.find()
            products.forEach((product) => {
                product.attributes.forEach((attribute) => {
                    const index = stats.findIndex((stat: { name: string; }) => stat.name == attribute.trait_type)
                    const rarity = this.rarities.find(r => r.name.trim() === attribute.value.trim())
                    if (rarity) {
                        if (index >= 0) {
                            const childrenIndex = stats[index]
                                .children
                                .findIndex((stat: { name: string; }) => {
                                    // @ts-ignore
                                    return stat.name.split(':')[0].trim() == rarity.rarity
                                })
                            if (childrenIndex >= 0) {
                                const splitName = stats[index].children[childrenIndex].name.split(':');
                                stats[index].children[childrenIndex].name = `${splitName[0]} : ${parseInt(splitName[1]) + 1}`
                                const attributeValueIndex = stats[index]
                                    .children[childrenIndex]
                                    .children
                                    .findIndex((el: { name: string; }) => el.name.split(':')[0].trim() === attribute.value.trim())
                                if (attributeValueIndex >= 0) {
                                    const splitName = stats[index]
                                        .children[childrenIndex]
                                        .children[attributeValueIndex]
                                        .name
                                        .split(':')
                                    stats[index]
                                        .children[childrenIndex]
                                        .children[attributeValueIndex]
                                        .name = `${splitName[0].trim()} : ${parseInt(splitName[1]) + 1}`
                                } else {
                                    stats[index].children[childrenIndex].children.push({
                                        id: uuidv4(),
                                        name: `${attribute.value.trim()} : 1`,
                                        children: []
                                    })
                                }
                            } else {
                                stats[index].children.push({
                                    id: uuidv4(),
                                    // @ts-ignore
                                    name: `${rarity.rarity} : 1`,
                                    children: [
                                        { id: uuidv4(), name: `${attribute.value.trim()} : 1`, children: [] }
                                    ]
                                })
                            }
                        } else {
                            stats.push({
                                id: uuidv4(),
                                name: attribute.trait_type,
                                children: [
                                    {
                                        id: uuidv4(),
                                        // @ts-ignore
                                        name: `${rarity.rarity} : 1`,
                                        children: [
                                            { id: uuidv4(), name: `${attribute.value.trim()} : 1`, children: [] }
                                        ]
                                    }
                                ],
                            })
                        }
                    }
                })
            })
            return stats
        } catch (e: any) {
            await this.catchError(e)
            return stats
        }
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