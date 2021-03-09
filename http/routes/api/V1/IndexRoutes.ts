import { Request, Response } from 'express';
import fs from 'fs';
import appRoot from 'app-root-path';
import { randomIntFromInterval } from "../../../../functions";
import PunkGeneratorService from "../../../../services/PunkGeneratorService";
import { v4 as uuidv4 } from 'uuid';
import GIFEncoder from 'gifencoder';
// @ts-ignore
import pngFileStream from 'png-file-stream';

const express = require('express');
const router = express.Router();

router.get('/generate', async (req: Request, res: Response) => {
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
    const uuid = uuidv4();
    fs.mkdirSync(`${appRoot.path}/punks/${uuid}`);
    for (const image of images) {
        const punkGenerator = new PunkGeneratorService(800, 800);
        const newImage = await punkGenerator.generate(image)
        // @ts-ignore
        fs.writeFileSync(`${appRoot.path}/punks/${uuid}/${counter + 1}.png`, newImage);
        counter += 1;
    }
    const encoder = new GIFEncoder(800, 800);
    const stream = pngFileStream(`${appRoot.path}/punks/${uuid}/*.png`)
        .pipe(encoder.createWriteStream({ repeat: 0, delay: 300, quality: 10 }))
        .pipe(fs.createWriteStream(`${appRoot.path}/punks/${uuid}/punk.gif`));

    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });

    res.status(200).sendFile(`${appRoot.path}/punks/${uuid}/punk.gif`);
});

module.exports = router;
