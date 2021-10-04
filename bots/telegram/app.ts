import fs from 'fs-extra'
import TelegramBot from 'node-telegram-bot-api'
import {config} from 'dotenv'
import appRoot from "app-root-path";
import redis from "redis";
import {Product} from "../../models/Product";
import {connect} from "../../functions";

(async () => {
    try {
        config()
        await connect()
        const chatIdsPath = `${appRoot}/bots/telegram/chat_ids.json`
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', {polling: true});
        bot.onText(/\/start/, (msg, match) => {
            const chatId = msg.chat.id;
            const chatIds: number[] = JSON.parse(fs.readFileSync(chatIdsPath, 'utf8'))
            const existChatId = chatIds.findIndex((id) => id === chatId)
            if (existChatId < 0) {
                chatIds.push(chatId)
                fs.rmSync(chatIdsPath)
                fs.writeJSON(chatIdsPath, chatIds)
            }

            bot.sendMessage(chatId, 'Bot is active');
        });

        const subscriber = redis.createClient()
        subscriber.on('message', async (channel: string, message) => {
            if (channel === 'unicorn:sold') {
                const product = await Product.findOne(parseInt(message))
                if (product && (product.status === Product.statuses.SOLD || product.status === Product.statuses.GIVE_AWAY)) {
                    const status = product.status === Product.statuses.SOLD ? 'sold' : 'given away'
                    const chatIds: number[] = JSON.parse(fs.readFileSync(chatIdsPath, 'utf8'))
                    chatIds.forEach((chatId) => {
                        bot.sendPhoto(
                            chatId,
                            `https://ipfs.io/ipfs/${process.env.PINATA_PRODUCT_CID}/${product.uuid}/1.png`,
                            { caption: `Unicorn #${product.id} ${status}!!` }
                        )
                    })
                }
            }
        })
        subscriber.subscribe('unicorn:sold')
    } catch (e) {
        console.log(e)
    }
})()