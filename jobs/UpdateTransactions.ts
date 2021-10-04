import EtherScanApi from "../services/EtherScanApi";
import {Transaction} from "../models/Transaction";
import {getRepository} from "typeorm";
import {connect} from "../functions";
import {Product} from "../models/Product";
import redis from "redis";

export = async () => {
    let isHandle = false;
    const etherScanApi = new EtherScanApi()
    setInterval(async () => {
        try {
            if (!isHandle) {
                isHandle = true
                await connect()
                const client = redis.createClient()
                const { result } = await etherScanApi.getTokenTransactions(1)
                for (const tokenTransaction of result) {
                    const [_, count] = await Transaction.findAndCount({where: {hash: tokenTransaction.hash}})
                    if (count <= 0) {
                        const product = await Product.findOne(parseInt(tokenTransaction.tokenID))
                        if (product) {
                            const { result } = await etherScanApi.getTransactionByHash(tokenTransaction.hash)
                            let method = 'Mint Unicorn'
                            if (result.from === '0x3d50ff5c00760a17e9248e9984b638e022717177') {
                                product.status = Product.statuses.GIVE_AWAY
                                method = 'Give Away'
                            } else {
                                product.status = Product.statuses.SOLD
                                method = 'Mint Unicorn'
                            }
                            await getRepository(Transaction).save({
                                product,
                                tokenID: parseInt(tokenTransaction.tokenID),
                                hash: tokenTransaction.hash,
                                from: tokenTransaction.from,
                                to: tokenTransaction.to,
                                method,
                                gas: tokenTransaction.gas,
                                gasPrice: tokenTransaction.gasPrice,
                                gasUsed: tokenTransaction.gasUsed,
                                transactionDate: new Date(parseInt(tokenTransaction.timeStamp) * 1000)
                            })
                            await product.save()
                            client.publish('unicorn:sold', JSON.stringify(product.id))
                        }
                    }
                }
                isHandle = false
            }
        } catch (e: any) {
            console.log(e)
        }
    }, 5000)
}
