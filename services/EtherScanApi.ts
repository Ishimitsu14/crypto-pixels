import  axios, {AxiosInstance} from 'axios'
import {IERC721List, Transaction} from "../types/TEtherscan";

class EtherScanApi {

    private axios: AxiosInstance
    private readonly contractAddress: string

    constructor() {
        this.axios = axios.create({
            baseURL: 'https://api.etherscan.io/api',
            params: {
                apikey: process.env.ETHER_SCAN_API_KEY || ''
            }
        })
        this.contractAddress = process.env.ETHER_SCAN_CONTRACT || ''
    }

    async getTokenTransactions(page: number): Promise<IERC721List> {
        try {
            const response = await this.axios.get('/', {
                params: {
                    module: 'account',
                    action: 'tokennfttx',
                    contractaddress: this.contractAddress,
                    page,
                    offset: 100,
                    sort: 'desc'
                }
            })
            return response.data
        } catch (e: any) {
            throw Error(e.message)
        }
    }

    async getTransactionByHash(hash: string): Promise<Transaction> {
        try {
            const response = await this.axios.get('/', {
                params: {
                    module: 'proxy',
                    action: 'eth_getTransactionByHash',
                    txhash: hash,
                }
            })
            return response.data
        } catch (e: any) {
            throw Error(e.message)
        }
    }
}

export = EtherScanApi