import pinataSDK from '@pinata/sdk'
import fs from 'fs';
import appRoot from "app-root-path";
import { config } from 'dotenv';
config()
const apiKey = process.env.PINATA_API_KEY || ''
const apiSecret = process.env.PINATA_API_SECRET || ''
const pinata = pinataSDK(apiKey, apiSecret);

const removeFromIPFS = async (pageOffset = 0) => {
    const pinList = await pinata.pinList({ status: 'pinned', pageLimit: 10, pageOffset })
    for (const row of pinList.rows) {
        await pinata.unpin(row.ipfs_pin_hash)
    }
    if (pinList.count > 10) {
        await removeFromIPFS(pageOffset + 1)
    }
}

(async function () {
    try {
        const metaDataDir = `${appRoot.path}/meta_data`
        await removeFromIPFS()
        fs.rmdirSync(metaDataDir, { recursive: true })
        process.exit()
    } catch (e: any) {
        console.log(e)
    }
})()