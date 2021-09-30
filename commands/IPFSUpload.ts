import pinataSDK from '@pinata/sdk'
import {Product} from '../models/Product';
import {IProductMetaData} from '../types/TProduct';
import fs from 'fs';
import appRoot from "app-root-path";
import {connect} from "../functions";
import {config} from 'dotenv';
config()
const metaDataDir = `${appRoot.path}/meta_data`
const apiKey = process.env.PINATA_API_KEY || ''
const apiSecret = process.env.PINATA_API_SECRET || ''
const pinataProductCid = process.env.PINATA_PRODUCT_CID || ''
const pinata = pinataSDK(apiKey, apiSecret);

const createMetaData = async () => {
    await connect()
    const products = await Product.find()
    for (const index in products) {
        const product = products[index]
        const metaData: IProductMetaData = {
            name: `${process.env.PRODUCT_NAME} #${parseInt(index) + 1}`,
            description: '',
            external_url: '',
            image: `ipfs://${pinataProductCid}/${product.uuid}/1.png`,
            attributes: product.attributes,
        }
        product.setMetaData(metaData)
        product.status = Product.statuses.UPLOADED_TO_IPFS
        await product.save()
        fs.appendFileSync(`${metaDataDir}/${parseInt(index) + 1}`, JSON.stringify(metaData))
    }
}

(async function () {
    try {
        fs.mkdirSync(`${appRoot.path}/meta_data`)
        await createMetaData()
        const response = await pinata.pinFromFS(metaDataDir)
        // fs.rmSync(`${appRoot}/ipfsData.json`, { recursive: true })
        fs.appendFileSync(`${appRoot}/ipfsData.json`, JSON.stringify(response))
        process.exit()
    } catch (e: any) {
        console.log(e)
    }
})()