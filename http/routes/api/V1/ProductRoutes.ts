import {Request, Response} from 'express';
import ProductGeneratorService from "../../../../services/ProductGeneratorService";
import appRoot from "app-root-path";
import {UploadedFile} from "express-fileupload";
import {Product} from "../../../../models/Product";
import {connect} from "../../../../functions";
import UploadService from "../../../../services/UploadService";
import {IProductMetaData} from "../../../../types/TProduct";
import {getRepository} from "typeorm";

const express = require('express');
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    await connect();
    const products = await Product.find()
    res.status(200).json(products);
});

router.get('/buy', async (req: Request, res: Response) => {
    await connect()
    let product = await Product.findOne({where: {status: Product.statuses.NOT_SOLD}})
    if (product) {
        const { count } = await getRepository(Product)
            .createQueryBuilder()
            .select('COUNT(id)', 'count')
            .where(
                'status IN (:status)',
                {status: [Product.statuses.SOLD, Product.statuses.PENDING]},
            )
            .getRawOne()
        const metaData: IProductMetaData = {
            name: `${process.env.PRODUCT_NAME} #${parseInt(count) + 1}`,
            description: '',
            external_url: '',
            image: `${process.env.BASE_URL}/api/v1/product/${product.uuid}`,
            attributes: product.attributes,
        }
        product.setMetaData(metaData)
        product.status = Product.statuses.PENDING
        product = await product.save()
        res.status(200).json({url: `${process.env.BASE_URL}/api/v1/product/metadata/${product.uuid}`})
    } else {
        res.status(404).json({error: {message: 'All products already sold'}})
    }
})

router.get('/:uuid', async (req: Request, res: Response) => {
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
        parseInt(req.body.width),
        parseInt(req.body.height),
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
            const message = await uploadService.upload(width, height)
            res.status(200).json({success: {message}})
        } catch (message: any) {
            res.status(500).json({error: {message: message}})
        }
    } else {
        res.status(400).json({error: {message: 'Bad request.'}})
    }
})


module.exports = router;
