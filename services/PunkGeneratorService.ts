import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { asyncLoadCanvasImage } from "../functions";
import resizeImageData from 'resize-image-data';

class PunkGeneratorService {
    private canvas: Canvas
    private readonly ctx: CanvasRenderingContext2D
    private currentWidth: number
    private currentHeight: number

    constructor(width: number, height: number) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
        this.currentHeight = height;
        this.currentWidth = width;
    }

    async generate(images: string[]) {
        try {
            for (const image of images) {
                const newImage = await asyncLoadCanvasImage(image, this.currentWidth, this.currentHeight);
                this.ctx.drawImage(newImage, 0, 0);
            }
            return this.canvas.toBuffer('image/png');
        } catch (e) {
            console.log(e);
        }
    }
}

export = PunkGeneratorService;
