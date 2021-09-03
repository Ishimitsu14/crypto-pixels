import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import {asyncLoadCanvasImage, connect, randomIntFromInterval} from "../functions";
import fs from 'fs';
import appRoot from 'app-root-path';
import { v4 as uuidv4 } from 'uuid';
import GIFEncoder from 'gifencoder';
// @ts-ignore
import pngFileStream from 'png-file-stream';
import redis from "redis";
import {createConnection} from "typeorm";
import {Product} from "../models/Product";

class ProductGeneratorService {
    private canvas: Canvas
    private ctx: CanvasRenderingContext2D
    private readonly countImages: number
    private readonly width: number
    private readonly height: number

    constructor(countImages: number, width: number, height: number) {
        this.countImages = countImages;
        this.width = width;
        this.height = height;
    }

    async generate(): Promise<void> {
        await connect();
        const iterations = new Array(this.countImages)
        let imagePaths: { paths: string[][]; hash: string }[] = []
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

    async getImagePaths(): Promise<{ paths: string[][]; hash: string }> {
        const paths: string[] = [];
        const images: string[][] = [];
        const bodyPartFolders = fs.readdirSync(`${appRoot.path}/assets`);
        bodyPartFolders.sort((a: string, b: string) => {
            const strA = a.split('-')
            const strB = b.split('-')
            return parseInt(strA[0]) - parseInt(strB[0])
        })
        for (const bodyPartFolder of bodyPartFolders) {
            const folders = fs.readdirSync(`${appRoot.path}/assets/${bodyPartFolder}`)
            paths.push(`${appRoot.path}/assets/${bodyPartFolder}/${randomIntFromInterval(1, folders.length)}`);
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
        return { hash, paths: images }
    }
}

export = ProductGeneratorService;
