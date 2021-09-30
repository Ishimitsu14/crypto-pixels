import {connect, randomIntFromInterval} from "../functions";
import fs from 'fs';
import appRoot from 'app-root-path';
import {IGenerateProduct, IImageAttribute, IProductData} from "../types/TGenerateProduct";
// @ts-ignore
import pngFileStream from 'png-file-stream';
import redis from "redis";
import {createQueryBuilder} from "typeorm";
import {Product} from "../models/Product";
import NotificationService from "./NotificationService";
import {IProductInfo, IProductStat, Rarities} from "../types/TProduct";

class ProductGeneratorService {
    private readonly countImages: number
    private readonly isAttributes: boolean
    private readonly channel = 'generate'

    constructor(
        countImages: number,
        isAttributes: boolean = false
        ) {
        this.countImages = countImages;
        this.isAttributes = isAttributes
    }

    async generate(): Promise<void> {
        try {
            const client = redis.createClient()
            await connect();
            const iterations = new Array(this.countImages)
            let productData: IProductData[] = []
            let i = 0
            for (let iteration of iterations) {
                productData[i] = await this.getGenerateData()
                i++
            }
            client.publish(
                `${this.channel}:start`,
                JSON.stringify({ productData, count: this.countImages }),
                () => client.quit()
            )
            this.onGenerateEnd()
        } catch (e: any) {
            const subscriber = redis.createClient()
            const notificationService = new NotificationService()
            await notificationService.publishMessage(
                e.message,
                notificationService.types.ERROR,
            )
            subscriber.quit()
        }
    }

    async getGenerateData(): Promise<IProductData> {
        try {
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
                const data = this.getPathToSubFolder(folder)
                if (data.attribute) {
                    attributes.push(data.attribute)
                }
                paths.push(data.path);
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
                return this.getGenerateData()
            }
            return {
                hash,
                paths: images,
                attributes,
            }
        } catch (e: any) {
            throw new Error(e.message)
        }
    }

    getPathToSubFolder(folder: string): {
        path: string;
        attribute?: IImageAttribute;
    } {
        let info = undefined
        let attribute = undefined
        const subFolders: string[] = []
        fs.readdirSync(`${appRoot.path}/assets/${folder}`)
            .forEach((el) => {
                if (el.indexOf('.json') >= 0) {
                    info = JSON.parse(fs.readFileSync(`${appRoot.path}/assets/${folder}/${el}`, 'utf8'))
                } else {
                    subFolders.push(el)
                }
            })
        const { subFolder } = this.getSubFolderByChances(subFolders, info)
        if (this.isAttributes) {
            attribute = this.getAttributeByPath(folder, subFolder)
        }
        return { path: `${appRoot.path}/assets/${folder}/${subFolder}`, attribute }
    }

    getSubFolderByChances(subFolders: string[], info?: IProductInfo[]): { subFolder: string; } {
        if (info && info.length > 0) {
            let value = 0
            const randomInt = randomIntFromInterval(1, Rarities.Common)
            // @ts-ignore
            const chancesArr = info.filter(el => Rarities[el.rarity] >= randomInt)
            const chance = chancesArr[randomIntFromInterval(0, chancesArr.length - 1)]
            return {
                subFolder: chance.name,
            }
        }
        return { subFolder: subFolders[randomIntFromInterval(0, subFolders.length - 1)] }
    }

    getAttributeByPath(traitTypePath: string, valuePath: string): IImageAttribute {
        const traitTypeArr = traitTypePath.split('-')
        let traitType = traitTypeArr[0]
        if (traitTypeArr.length > 1) {
            traitType = traitTypeArr[1]
        }
        return { trait_type: traitType, value: valuePath }
    }

    static mergeStats(stats: { [key: string]: any }[]) {
        const mergedStats: IProductStat[] = []
        stats.forEach((stat:{ [key: string]: any }, index) => {
            const arrStat = Object.keys(stat)
            arrStat.forEach((name: string) => {
                let newValue = undefined
                const value: string = stat[name]
                const currentMark = value.slice(0, 1) === '-' ? '-' : '+'
                const index = mergedStats.findIndex(stat => stat.name === name)
                if (index >= 0 && value.slice(-1) === '%') {
                    let mark = '-'
                    const mergedValue = mergedStats[index].value
                    const mergedMark = mergedValue.slice(0, 1)
                    if (mergedMark === '-' && currentMark === '-' ) mark = '-'
                    if (mergedMark === '+' && currentMark === '+' ) mark = '+'
                    if (mergedValue.slice(1, mergedValue.length - 1) >= value.slice(1, value.length - 1)) {
                        newValue = eval(
                            `${mergedValue.slice(1, mergedValue.length - 1)} ${mark} ${value.slice(1, value.length - 1)}`
                        )
                    } else {
                        newValue = eval(
                            `${value.slice(1, value.length - 1)} ${mark} ${mergedValue.slice(1, mergedValue.length - 1)}`
                        )
                    }
                    newValue = newValue > 0 ? `+${newValue}%` : `-${newValue}%`
                    mergedStats[index] = { name, value: newValue}
                } else {
                    mergedStats.push({ name, value })
                }
            })
        })
        return mergedStats
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
                        .values(generateProducts)
                        .execute()
                    const notificationService = new NotificationService()
                    await notificationService.publishMessage(
                        'Images is Generated',
                        notificationService.types.SUCCESS,
                    )
                    subscriber.quit()
                } catch (e: any) {
                    throw new Error(e.message)
                }
            }
        })
        subscriber.subscribe('generate:end')
    }
}

export = ProductGeneratorService;
