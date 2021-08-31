import { Request, Response } from 'express';
import GifGeneratorService from "../../../../services/GifGeneratorService";
import fs from "fs";
import appRoot from "app-root-path";
import redis from "redis";
import {UploadedFile} from "express-fileupload";
import AdmZip from "adm-zip";
const express = require('express');
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    let gifs = [];
    const uuidArray = fs.readdirSync(`${appRoot}/punks/`);
    for (const uuid of uuidArray) {
        if (uuid !== '.gitignore') {
            gifs.push({
                uuid,
                src: `${process.env.BASE_URL}/api/v1/gif/${uuid}`
            })
        }
    }
    res.status(200).json(gifs);
});

router.get('/generate', async (req: Request, res: Response) => {
    const gifGeneratorService = new GifGeneratorService(400, 400);
    await gifGeneratorService.generate();
    res.status(200).json({ gif: gifGeneratorService.src, uuid: gifGeneratorService.uuid, });
});

router.get('/:uuid', async (req: Request, res: Response) => {
    res.status(200).sendFile(`${appRoot}/punks/${req.params.uuid}/punk.gif`);
});

router.post('/upload-tiles/:width/:height', (req: Request, res: Response) => {
    const redisClient = redis.createClient()
    let file: UploadedFile;
    let uploadPath: string | Buffer | undefined;

    if (!req.files) {
        return res.status(400).json({ error: { message: 'No files were uploaded.' } })
    }

    // @ts-ignore
    file = req.files.source_tiles
    uploadPath = `${appRoot.path}/source_tiles_archives/${file.name}`
    file.mv(uploadPath, function (err) {
        if (err) {
            return res.status(500).json({ error: { message: err.message } })
        }

        const zip = new AdmZip(uploadPath)
        zip.extractAllTo(`${appRoot}/source_tiles/`, true)
        redisClient.publish('resize', `${req.params.width},${req.params.height}`)
        res.status(200).json({ success: { message: 'File is uploaded and resized' } })
    })
})


module.exports = router;
