import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import {asyncLoadCanvasImage, connect, randomIntFromInterval} from "../functions";
import fs from 'fs';
import appRoot from 'app-root-path';
import {IImageAttribute, IImagePaths} from "../types/TGenerateProduct";
// @ts-ignore
import pngFileStream from 'png-file-stream';
import redis from "redis";
import {createConnection} from "typeorm";
import {Product} from "../models/Product";

class ProductGeneratorService {
    private readonly countImages: number
    private readonly width: number
    private readonly height: number
    private readonly isAttributes: boolean

    constructor(countImages: number, width: number, height: number, isAttributes: boolean = false) {
        this.countImages = countImages;
        this.width = width;
        this.height = height;
        this.isAttributes = isAttributes
    }

    async generate(): Promise<void> {
        await connect();
        const iterations = new Array(this.countImages)
        let imagePaths: IImagePaths[] = []
        let i = 0
        for (let iteration of iterations) {
            imagePaths[i] = await this.getImagePaths()
            i++
        }
        const redisClient = redis.createClient()
        redisClient.set('count_generate_images', this.countImages.toString())
        redisClient.set('width_generate_images', this.width.toString())
        redisClient.set('height_generate_images', this.height.toString())
        redisClient.publish('generate', JSON.stringify(imagePaths))
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

    getAttributeByPath(namePath: string, valuePath: string): IImageAttribute {
        const nameArr = namePath.split('-')
        let name = nameArr[0]
        if (nameArr.length > 1) {
            name = nameArr[1]
        }
        const valueArr = valuePath.split('-')
        let value = valueArr[0]
        if (valueArr.length > 1) {
            value = valueArr[1]
        }
        return { name, value }
    }

}

export = ProductGeneratorService;
