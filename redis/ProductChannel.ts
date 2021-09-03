import {IGifs} from "../types/TGifs";
import {Product} from "../models/Product";
import {createConnection, createQueryBuilder} from "typeorm";

export default async (channel: string, message: string) => {
    if (channel === 'products') {
        const gifs: IGifs[] = JSON.parse(message)
       try {
            const connection = await createConnection();
            await createQueryBuilder()
               .insert()
               .into(Product)
               .values(gifs.map(gif => ({ uuid: gif.Uuid, path: gif.Path, hash: gif.Hash })))
               .execute()
           await connection.close()
       } catch (e) {
           console.log(e)
       }
    }
}