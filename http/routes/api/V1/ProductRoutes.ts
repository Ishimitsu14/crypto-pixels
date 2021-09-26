import {Request, Response} from 'express';
import ProductGeneratorService from "../../../../services/ProductGeneratorService";
import appRoot from "app-root-path";
import {UploadedFile} from "express-fileupload";
import {Product} from "../../../../models/Product";
import {connect} from "../../../../functions";
import UploadService from "../../../../services/UploadService";
import {IProductMetaData} from "../../../../types/TProduct";
import {getRepository} from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import RarityService from "../../../../services/RarityService";

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

router.get('/stats', async (req: Request, res: Response) => {
    try {
        const rarities = await RarityService.getRarity()
        const stats: any = [];
        await connect();
        const products = await Product.find()
        products.forEach((product) => {
            product.attributes.forEach((attribute) => {
                const index = stats.findIndex((stat: { name: string; }) => stat.name == attribute.trait_type)
                const rarity = rarities.find(r => r.name.trim() === attribute.value.trim())
                if (index >= 0) {
                    const childrenIndex = stats[index]
                        .children
                        .findIndex((stat: { name: string; }) => {
                            // @ts-ignore
                            return stat.name.split(':')[0].trim() == rarity.rarity
                        })
                    if (childrenIndex >= 0) {
                        const splitName = stats[index].children[childrenIndex].name.split(':');
                        stats[index].children[childrenIndex].name = `${splitName[0]} : ${parseInt(splitName[1]) + 1}`
                        const attributeValueIndex = stats[index]
                            .children[childrenIndex]
                            .children
                            .findIndex((el: { name: string; }) => el.name.split(':')[0].trim() === attribute.value.trim())
                        if (attributeValueIndex >= 0) {
                            const splitName = stats[index]
                                .children[childrenIndex]
                                .children[attributeValueIndex]
                                .name
                                .split(':')
                            stats[index]
                                .children[childrenIndex]
                                .children[attributeValueIndex]
                                .name = `${splitName[0].trim()} : ${parseInt(splitName[1]) + 1}`
                        } else {
                            stats[index].children[childrenIndex].children.push({
                                id: uuidv4(),
                                name: `${attribute.value.trim()} : 1`
                            })
                        }
                    } else {
                        stats[index].children.push({
                            id: uuidv4(),
                            // @ts-ignore
                            name: `${rarity.rarity} : 1`,
                            children: [
                                { id: uuidv4(), name: `${attribute.value.trim()} : 1` }
                            ]
                        })
                    }
                } else {
                    stats.push({
                        id: uuidv4(),
                        name: attribute.trait_type,
                        children: [
                            {
                                id: uuidv4(),
                                // @ts-ignore
                                name: `${rarity.rarity} : 1`,
                                children: [
                                    { id: uuidv4(), name: `${attribute.value.trim()} : 1` }
                                ]
                            }
                        ],
                    })
                }
            })
        })
        res.status(200).json(stats)
    } catch (e: any) {
        console.log(e)
        res.status(500).json({ error: { message: e.message} })
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
