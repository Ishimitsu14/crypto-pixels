import EtherScanApi from "../services/EtherScanApi";
import {Transaction} from "../models/Transaction";
import {getRepository} from "typeorm";
import {connect} from "../functions";
import {Product} from "../models/Product";
import redis from "redis";

export = async () => {
    const etherScanApi = new EtherScanApi()
    setInterval(async () => {
        try {
            await connect()
            const client = redis.createClient()
            const {result} = await etherScanApi.getTransactions(1)
            result.forEach((result) => {
                Transaction.findAndCount({where: {hash: result.hash}})
                    .then(([_, count]) => {
                        if (count <= 0) {
                            Product.findOne(parseInt(result.tokenID))
                                .then((product) => {
                                    if (product) {
                                        getRepository(Transaction).save({
                                            product,
                                            tokenID: parseInt(result.tokenID),
                                            hash: result.hash,
                                            from: result.from,
                                            to: result.to,
                                            gas: result.gas,
                                            gasPrice: result.gasPrice,
                                            gasUsed: result.gasUsed,
                                            transactionDate: new Date(parseInt(result.timeStamp) * 1000)
                                        })
                                            .then(() => {
                                                product.status = Product.statuses.SOLD
                                                product.save()
                                                    .then(() => {
                                                        client.publish('unicorn:sold', JSON.stringify(product.id))
                                                    })
                                                    .catch((e: any) => console.log(e))
                                            })
                                            .catch((e: any) => console.log(e))
                                    }
                                })
                                .catch((e: any) => console.log(e))
                        }
                    })
            })
        } catch (e: any) {
            console.log(e)
        }
    }, 5000)
}
