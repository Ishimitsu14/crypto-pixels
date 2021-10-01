import {config} from 'dotenv'
import Discord, { MessageEmbed } from 'discord.js'
import {Product} from "../../models/Product";
import {connect} from "../../functions";
import RarityService from "../../services/RarityService";


(async () => {
    config()
    await connect()
    const prefix = '/'
    // @ts-ignore
    const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]})
    const rarityService = new RarityService()

    client.on('message', async (response) => {
        if (response.author.bot) return;
        if (!response.content.startsWith(prefix)) return;

        let message = ''
        const commandBody = response.content.slice(prefix.length)
        const args = commandBody.split(' ')
        const command = args.shift()
        if (command) {
            switch (command.toLowerCase()) {
                case 'check':
                    message = args[0] ? args[0] : ''
                    break
                default:
                    message = ''
            }
            if (message && !Number.isNaN(parseInt(message))) {
                const product = await Product.findOne(
                    {
                        where: {
                            id: parseInt(message),
                            status: Product.statuses.SOLD
                        }
                    }
                )
                if (product) {
                    const attributes: { name: string; value: string; inline: boolean }[] = []
                    let index = 0
                    for (const attribute of product.attributes) {
                        const rarity = rarityService.rarities.find((x) => x.name === attribute.value)
                        if (rarity) {
                            const rarityWithColor = "```arm" + '\n' +
                                rarity.rarity +
                                '```'
                            attributes.push({
                                name: attribute.trait_type,
                                value: `${attribute.value}:
                                ${rarityWithColor}`,
                                inline: true
                            })
                            index += 1
                        }
                        if (index === 2) {
                            attributes.push({
                                name: '\u200b',
                                value: '\u200b',
                                inline: false,
                            })
                            index = 0
                        }
                    }
                    const embed = {
                        color: '#ff0000',
                        title: product.metaData.name,
                        url: `https://opensea.io/assets/0x1a8fe1959e288c51295f7d44e3991799685eac83/${message}`,
                        author: {
                            name: 'Rarity of Unicorns',
                            icon_url: 'https://i.ibb.co/LZ74FyZ/favicon.png',
                            url: 'https://ucmv.io',
                        },
                        thumbnail: {
                            url: 'https://i.ibb.co/LZ74FyZ/favicon.png',
                        },
                        fields: attributes,
                        image: {
                            url: `https://ipfs.io/ipfs/${process.env.PINATA_PRODUCT_CID}/${product.uuid}/1.png`,
                        },
                        timestamp: new Date(),
                    }
                    await response.channel.send({ embed })
                } else {
                    await response.reply('This Unicorn not minted yet. Check your Unicorn id!')
                }
            } else {
                await response.reply('This Unicorn not minted yet. Check your Unicorn id!')
            }
        }
    })
    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log('isRunning')
})()