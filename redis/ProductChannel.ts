import {IGenerateProduct} from "../types/TGenerateProduct";
import {Product} from "../models/Product";
import {createQueryBuilder} from "typeorm";
import {connect} from "../functions";

export default async (channel: string, message: string) => {
    if (channel === 'products') {
        const generateProducts: IGenerateProduct[] = JSON.parse(message)
        try {
            await connect();
            await createQueryBuilder()
                .insert()
                .into(Product)
                .values(generateProducts.map(product => (
                   {
                       uuid: product.Uuid,
                       image: product.ImagePath,
                       gif: product.GifPath,
                       hash: product.Hash,
                   }
                   )))
                .execute()
        } catch (e) {
            console.log(e)
        }
    }
}