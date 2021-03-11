import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { asyncLoadCanvasImage, randomIntFromInterval } from "../functions";
import resizeImageData from 'resize-image-data';
import fs from "fs";
import appRoot from "app-root-path";
import { v4 as uuidv4 } from "uuid";
import GIFEncoder from "gifencoder";
// @ts-ignore
import pngFileStream from 'png-file-stream';

class PunkGeneratorService {
    private canvas: Canvas
    private ctx: CanvasRenderingContext2D
    private currentWidth: number
    private currentHeight: number
    public link: string;
    public uuid: string;

    constructor(width: number, height: number) {
        this.currentHeight = height;
        this.currentWidth = width;
    }

    async createCanvas(images: string[]) {
        try {
            this.canvas = createCanvas(this.currentWidth, this.currentHeight);
            this.ctx = this.canvas.getContext('2d');
            for (const image of images) {
                const newImage = await asyncLoadCanvasImage(image);
                this.ctx.drawImage(newImage, 0, 0);
            }
            return this.canvas.toBuffer('image/png');
        } catch (e) {
            console.log(e);
        }
    }

    async generate() {
        const paths: string[] = [];
        const images: string[][] = [
            [], [], [], []
        ];
        const bodyPartFolders = fs.readdirSync(`${appRoot.path}/assets`);
        for (const bodyPartFolder of bodyPartFolders) {
            const folders = fs.readdirSync(`${appRoot.path}/assets/${bodyPartFolder}`)
            paths.push(`${appRoot.path}/assets/${bodyPartFolder}/${randomIntFromInterval(1, folders.length)}`);
        }
        for (const path of paths) {
            const files = fs.readdirSync(path)
            for(let i = 1; i <= 4; i++) {
                images[i - 1].push(`${path}/${files[i - 1]}`);
            }
        }
        let counter = 0;
        this.uuid = uuidv4();
        fs.mkdirSync(`${appRoot.path}/punks/${this.uuid}`);
        for (const image of images) {
            const newImage = await this.createCanvas(image);
            // @ts-ignore
            fs.writeFileSync(`${appRoot.path}/punks/${this.uuid}/${counter + 1}.png`, newImage);
            counter += 1;
        }
        const encoder = new GIFEncoder(this.currentWidth, this.currentHeight);
        const stream = pngFileStream(`${appRoot.path}/punks/${this.uuid}/*.png`)
            .pipe(encoder.createWriteStream({ repeat: 0, delay: 300, quality: 10 }))
            .pipe(fs.createWriteStream(`${appRoot.path}/punks/${this.uuid}/punk.gif`));

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        this.link = `${appRoot.path}/punks/${this.uuid}/punk.gif`;
    }
}

export = PunkGeneratorService;
