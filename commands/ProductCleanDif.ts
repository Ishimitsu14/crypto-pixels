import {connect} from "../functions";
import {Product} from "../models/Product";
import fs from "fs";
import appRoot from "app-root-path";
import {getRepository} from "typeorm";

const difference = (a1: any[], a2: any[]) => {
    const a2Set = new Set(a2);
    return a1.filter((x: any) => !a2Set.has(x));
}

const symmetricDifference = (a1: any[], a2: any[]) => {
    return difference(a1, a2).concat(difference(a2, a1))
}

(async function () {
    try {
        await connect()
        const promises: Promise<any>[] = []
        const productsFolders = fs.readdirSync(`${appRoot.path}/products`)
        console.log(productsFolders.length)
        const products = await getRepository(Product).find({select: ['uuid']})
        const dif = symmetricDifference(productsFolders, products.map(({uuid}) => uuid))
        dif.forEach((folder) => (
            promises.push(new Promise<any>(resolve => {
                fs.rmdir(
                    `${appRoot.path}/products/${folder}`,
                    {recursive: true},
                    (err) => {
                        if (err) {
                            throw Error(err.message)
                        } else {
                            resolve(true)
                        }
                    }
                )
            }))
        ))
        await Promise.all(promises)
        process.exit()
    } catch (e: any) {
        console.log(e.message)
    }
})()