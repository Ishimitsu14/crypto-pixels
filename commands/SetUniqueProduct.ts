import {connect} from "../functions";
import {Product} from "../models/Product";
import appRoot from "app-root-path";
import fs from 'fs-extra'

import {IProductInfo} from "../types/TProduct";
import ProductGeneratorService from "../services/ProductGeneratorService";
import {getRepository} from "typeorm";



(async function () {
    try {
        await connect()
        const promises: Promise<any>[] = []
        const products = await getRepository(Product)
            .createQueryBuilder()
            .orderBy("RAND()")
            .limit(30)
            .getMany();
        const uniqueUnicorns = fs.readdirSync(`${appRoot}/uniq-unicorns`)
        uniqueUnicorns.forEach((uniqueUnicorn, index) => {
            const product = products[index]
            const info = JSON.parse(fs.readFileSync(`${appRoot}/uniq-unicorns/${uniqueUnicorn}/1.json`, 'utf8'))
            product.attributes = info.attributes
            fs.removeSync(`${appRoot}/products/${product.uuid}/1.png`)
            fs.copySync(`${appRoot}/uniq-unicorns/${uniqueUnicorn}/1.png`, `${appRoot}/products/${product.uuid}/1.png`)
            promises.push(product.save())
        })
        await Promise.all(promises)
        console.log(products.map((product) => product.id))
        process.exit()
    } catch (e: any) {
        console.log(e.message)
    }
})()
