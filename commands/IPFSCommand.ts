import pinataSDK from '@pinata/sdk'
import {Product} from '../models/Product';
import {IProductMetaData} from '../types/TProduct';
import fs from 'fs';

(async function () {
    const apiKey = process.env.PINATA_API_KEY || ''
    const apiSecret = process.env.PINATA_API_SECRET || ''
    const pinata = pinataSDK(apiKey, apiSecret);
    const products = await Product.find()
    for (let index in products) {
        const product = products[index]
        // const readableStreamForFile = fs.createReadStream(``);
        const metaData: IProductMetaData = {
            name: `${process.env.PRODUCT_NAME} #${parseInt(index) + 1}`,
            description: '',
            external_url: '',
            image: `${process.env.BASE_URL}/api/v1/product/${product.uuid}`,
            attributes: product.attributes,
        }
        product.setMetaData(metaData)
        product.status = Product.statuses.UPLOADED_TO_IPFS
        await product.save()
    }
})()