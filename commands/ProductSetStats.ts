import {connect} from "../functions";
import {Product} from "../models/Product";
import appRoot from "app-root-path";
import fs from "fs";
import {IProductInfo} from "../types/TProduct";
import ProductGeneratorService from "../services/ProductGeneratorService";



(async function () {
    try {
        await connect()
        const promises: Promise<any>[] = []
        const products = await Product.find()
        products.forEach((product) => {
            const stats: {[key: string]: any}[] = []
            const assets = fs.readdirSync(`${appRoot}/assets`)
            assets.forEach((asset) => {
                const info: IProductInfo[] = JSON.parse(fs.readFileSync(`${appRoot}/assets/${asset}/info.json`, 'utf8'))
                const trait = info.find((info) => (
                    product.attributes.findIndex((attribute) => attribute.value === info.name) >= 0
                ))
                if (trait && trait.stats) {
                    stats.push(trait.stats)
                }
            })
            product.stats = ProductGeneratorService.mergeStats(stats)
            promises.push(product.save())
        })
        await Promise.all(promises)
        process.exit()
    } catch (e: any) {
        console.log(e.message)
    }
})()