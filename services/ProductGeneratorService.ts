import {connect, randomIntFromInterval} from "../functions";
import fs from 'fs';
import appRoot from 'app-root-path';
import {IGenerateProduct, IImageAttribute, IImagePaths} from "../types/TGenerateProduct";
// @ts-ignore
import pngFileStream from 'png-file-stream';
import redis, {RedisClient} from "redis";
import {createQueryBuilder} from "typeorm";
import {Product} from "../models/Product";
import NotificationService from "./NotificationService";

class ProductGeneratorService {
    private readonly countImages: number
    private readonly width: number
    private readonly height: number
    private readonly isAttributes: boolean
    private readonly channel = 'generate'

    constructor(countImages: number, width: number, height: number, isAttributes: boolean = false) {
        this.countImages = countImages;
        this.width = width;
        this.height = height;
        this.isAttributes = isAttributes
    }

    async generate(): Promise<void> {
        const client = redis.createClient()
        await connect();
        const iterations = new Array(this.countImages)
        let imagePaths: IImagePaths[] = []
        let i = 0
        for (let iteration of iterations) {
            imagePaths[i] = await this.getImagePaths()
            i++
        }
        client.set('count_generate_images', this.countImages.toString())
        client.set('width_generate_images', this.width.toString())
        client.set('height_generate_images', this.height.toString())
        client.publish(`${this.channel}:start`, JSON.stringify(imagePaths), () => client.quit())
        this.onGenerateEnd()
    }

    async getImagePaths(): Promise<IImagePaths> {
        const paths: string[] = [];
        const images: string[][] = [];
        const attributes: IImageAttribute[] = [];
        const folders = fs.readdirSync(`${appRoot.path}/assets`);
        folders.sort((a: string, b: string) => {
            const strA = a.split('-')
            const strB = b.split('-')
            return parseInt(strA[0]) - parseInt(strB[0])
        })
        for (const folder of folders) {
            const subFolders = fs.readdirSync(`${appRoot.path}/assets/${folder}`)
            const subFolder = subFolders[randomIntFromInterval(0, subFolders.length - 1)]
            if (this.isAttributes) {
                attributes.push(this.getAttributeByPath(folder, subFolder))
            }
            paths.push(`${appRoot.path}/assets/${folder}/${subFolder}`);
        }
        const hash = paths.join('')
        for (const path of paths) {
            const files = fs.readdirSync(path)
            files.forEach((item, index) => {
                if (!images[index]) {
                    images[index] = []
                }
                images[index].push(`${path}/${item}`)
            })
        }
        const [_, count] = await Product.findAndCount({ where: { hash } });
        if (count < 0) {
            return this.getImagePaths()
        }
        return { hash, paths: images, attributes }
    }

    getAttributeByPath(traitTypePath: string, valuePath: string): IImageAttribute {
        const traitTypeArr = traitTypePath.split('-')
        let traitType = traitTypeArr[0]
        if (traitTypeArr.length > 1) {
            traitType = traitTypeArr[1]
        }
        const valueArr = valuePath.split('-')
        let value = valueArr[0]
        if (valueArr.length > 1) {
            value = valueArr[1]
        }
        return { traitType, value }
    }

    onGenerateEnd() {
        const subscriber = redis.createClient()
        subscriber.on('message', async (channel: string, message: string) => {
            if (channel === `${this.channel}:end`) {
                const generateProducts: IGenerateProduct[] = JSON.parse(message)
                try {
                    await connect();
                    await createQueryBuilder()
                        .insert()
                        .into(Product)
                        .values(generateProducts.map(product => {
                            const data = {
                                uuid: product.Uuid,
                                image: product.ImagePath,
                                gif: product.GifPath,
                                hash: product.Hash
                            }
                            if (product.Attributes && product.Attributes.length > 0) {
                                // @ts-ignore
                                data.attributes = product.Attributes
                                    .map(i => ({ trait_type: i.TraitType, value: i.Value }))
                            }
                            return data
                        }))
                        .execute()
                    const notificationService = new NotificationService()
                    await notificationService.publishMessage(
                        'Images is Generated',
                        notificationService.types.SUCCESS,
                    )
                    subscriber.quit()
                } catch (e) {
                    console.log(e)
                }
            }
        })
        subscriber.subscribe('generate:end')
    }
}

export = ProductGeneratorService;
