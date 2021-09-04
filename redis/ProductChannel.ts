import {IGenerateProduct} from "../types/TGenerateProduct";
import {Product} from "../models/Product";
import {createQueryBuilder} from "typeorm";
import {connect} from "../functions";
import events from "events";

export default async (channel: string, message: string) => {
    if (channel === 'products') {
        const generateProducts: IGenerateProduct[] = JSON.parse(message)
        try {
            const em = new events.EventEmitter()
            await connect();
            await createQueryBuilder()
                .insert()
                .into(Product)
                .values(generateProducts.map(product => {
                    let p = {}
                    if (product.Attributes && product.Attributes.length > 0) {
                        p = {
                            uuid: product.Uuid,
                            image: product.ImagePath,
                            gif: product.GifPath,
                            hash: product.Hash,
                            attributes: JSON.stringify(product.Attributes.map(i => ({ name: i.Name, value: i.Value })))
                        }
                    } else {
                        p = {
                            uuid: product.Uuid,
                            image: product.ImagePath,
                            gif: product.GifPath,
                            hash: product.Hash
                        }
                    }
                    return p
                }))
                .execute()
            em.emit('notification','Pictures were generated')
        } catch (e) {
            console.log(e)
        }
    }
}