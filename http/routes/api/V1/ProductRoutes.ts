import { Request, Response } from 'express';
import ProductGeneratorService from "../../../../services/ProductGeneratorService";
import appRoot from "app-root-path";
import redis from "redis";
import {UploadedFile} from "express-fileupload";
import AdmZip from "adm-zip";
import {createConnection} from "typeorm";
import {Product} from "../../../../models/Product";
import {connect} from "../../../../functions";
const express = require('express');
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    await connect();
    const products = await Product.find()
    res.status(200).json(products);
});

router.get('/:uuid', async (req: Request, res: Response) => {
    await connect();
    const product = await Product.findOne({ where: { uuid: req.params.uuid } })
    try {
        res.status(200).sendFile(`${appRoot}${product?.gif ? product?.gif : product?.image}`)
    } catch (e) {
        console.log(e)
    }
});

router.post('/generate',(req: Request, res: Response) => {
    const gifGeneratorService = new ProductGeneratorService(
        req.body.countImages,
        req.body.width,
        req.body.height,
        req.body.isAttributes
    );
    gifGeneratorService.generate();
    res.status(200).json({ success: { message: 'Images are processed' } });
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
        const { width, height } = req.query
        if (typeof width == 'string' && typeof height == 'string') {
            redisClient.publish('resize', JSON.stringify({ width, height, zip: file.name }))
        }
        res.status(200).json({ success: { message: 'File is uploaded and resized' } })
    })
})


module.exports = router;
