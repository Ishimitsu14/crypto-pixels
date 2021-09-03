import { Request, Response } from 'express';
import ProductGeneratorService from "../../../../services/ProductGeneratorService";
import appRoot from "app-root-path";
import redis from "redis";
import {UploadedFile} from "express-fileupload";
import AdmZip from "adm-zip";
import {createConnection} from "typeorm";
import {Product} from "../../../../models/Product";
const express = require('express');
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const connection = await createConnection();
    const products = await Product.find({ where: { isSold: false } })
    await connection.close()
    res.status(200).json(products);
});

router.get('/generate',(req: Request, res: Response) => {
    const gifGeneratorService = new ProductGeneratorService(
        parseInt(<string>req.query.countImages),
        parseInt(<string>req.query.width),
        parseInt(<string>req.query.height),
    );
    gifGeneratorService.generate();
    res.status(200).json({ success: { message: 'Images are processed' } });
});

router.get('/:uuid', async (req: Request, res: Response) => {
    try {
        res.status(200).sendFile(`${appRoot}/products/${req.params.uuid}/1.png`)
    } catch (e) {
        console.log(e)
    }
});

router.post('/upload-tiles', (req: Request, res: Response) => {
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
        redisClient.publish('resize', `${req.query.width},${req.query.height}`)
        res.status(200).json({ success: { message: 'File is uploaded and resized' } })
    })
})


module.exports = router;
