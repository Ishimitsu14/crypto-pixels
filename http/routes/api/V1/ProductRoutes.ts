import {Request, Response} from 'express';
import ProductGeneratorService from "../../../../services/ProductGeneratorService";
import appRoot from "app-root-path";
import {UploadedFile} from "express-fileupload";
import {Product} from "../../../../models/Product";
import {connect} from "../../../../functions";
import UploadService from "../../../../services/UploadService";
import RarityService from "../../../../services/RarityService";
import ProductPaginateService from "../../../../services/ProductPaginateService";
import fs from "fs";
import path from "path";

const express = require('express');
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const productPaginateService = new ProductPaginateService(
            {
                page: parseInt(<string>req.query.page),
                perPage: parseInt(<string>req.query.perPage),
                sortBy: <string>req.query.sortBy,
                sortDesc: parseInt(<string>req.query.sortDesc),
            }
        )
        res.status(200).json(await productPaginateService.getProducts());
    } catch (e: any) {
        res.status(400).json({ error: { message: 'Bad request' } })
    }
});

router.get('/rarity', async (req: Request, res: Response) => {
    try {
        const rarityService = new RarityService()
        const stats = await rarityService.getRarities()
        res.status(200).json(stats)
    } catch (e: any) {
        res.status(500).json({ error: { message: e.message} })
    }
})

router.get('/rarity/:id', async (req: Request, res: Response) => {
    try {
        await connect()
        const product = await Product.findOne(req.params.id)
        if (product) {
            const rarityService = new RarityService()
            const rarity = rarityService.getRaritiesByProduct(product)
            res.status(200).json(rarity)
        } else {
            res.status(400).json({ error: { message: 'Bad request' } })
        }
    } catch (e: any) {
        res.status(500).json({ error: { message: e.message} })
    }
})

router.get('/:id', async (req: Request, res: Response) => {
    await connect();
    try {
        const product = await Product.findOne({where: {id: req.params.id}})
        res.status(200).json(product)
    } catch (e: any) {
        res.status(400).json({ error: { message: 'Bad request' } })
    }
});

router.get('/image/:uuid', async (req: Request, res: Response) => {
    await connect();
    const product = await Product.findOne({where: {uuid: req.params.uuid}})
    try {
        res.status(200).sendFile(`${appRoot}${product?.gif ? product?.gif : product?.image}`)
    } catch (e) {
        console.log(e)
    }
});

router.get('/metadata/:uuid', async (req: Request, res: Response) => {
    await connect();
    const product = await Product.findOne({where: {uuid: req.params.uuid}})
    try {
        res.status(200).json(product?.metaData)
    } catch (e) {
        console.log(e)
    }
});

router.post('/generate', (req: Request, res: Response) => {
    const gifGeneratorService = new ProductGeneratorService(
        parseInt(req.body.countImages),
        req.body.isAttributes
    );
    gifGeneratorService.generate();
    res.status(200).json({success: {message: 'Images are processed'}});
});

router.post('/upload-tiles', async (req: Request, res: Response) => {
    // @ts-ignore
    const file: UploadedFile = req.files.source_tiles;
    const {width, height} = req.query

    if (!req.files) {
        return res.status(400).json({error: {message: 'No files were uploaded.'}})
    }

    if (typeof width === 'string' && typeof height === 'string') {
        try {
            const uploadService = new UploadService(file, `${appRoot.path}/source_tiles_archives`)
            await uploadService.upload()
            uploadService.resizeArchive(width, height)
            res.status(200).json({success: { message: 'Archive successfully uploaded await for notification' }})
        } catch (message: any) {
            res.status(500).json({error: {message: message}})
        }
    } else {
        res.status(400).json({error: {message: 'Bad request.'}})
    }
})

router.post('/upload/:id', async (req: Request, res: Response) => {
    const product = await Product.findOne(req.params.id)
    // @ts-ignore
    const file: UploadedFile = req.files.file;
    if (!req.files || !product) {
        return res.status(400).json({error: {message: 'No files were uploaded or product is not found.'}})
    }
    file.name = product?.image ? path.basename(product?.image) : file.name
    const uploadService = new UploadService(file, `${appRoot.path}/products/${product.uuid}`)
    await uploadService.upload()
    res.status(200).json(product)
})

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const product = await Product.findOne(req.params.id)
        if (product) {
            fs.rmdirSync(`${appRoot}/products/${product.uuid}`, { recursive: true })
            await product.remove()
            res.status(200).json({ success: { message: 'Product is deleted' } })
        } else {
            throw new Error('Product is not found')
        }
    } catch (e: any) {
        res.status(400).json({ error: { message: e.message } })
    }
})

module.exports = router;
