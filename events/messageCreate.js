const discord = require("discord.js")
const quickdb = require("quick.db")

const sussyWords = require("./../utils/sussywords.json") // 60-second timeout (?)
const racialSlurs = require("./../utils/slurs.json") // Idk bro thats pretty heavy stuff right there
const generalSwears = require("./../utils/swears.json") // 10-min timeout
module.exports = messageCreate
/**
 * @param {discord.Message} message 
 * @param {quickdb.QuickDB} db
 * @param {discord.Client} client
 */
async function messageCreate(message, db, client) {
    if (message.author.bot) return
    // User sent the message. Did they swear? Does this server allow swearing?
    //todo let server managers change swearing permissions
    let dbChannel = await db.get(`channels.${message.channelId}`)
    if (dbChannel) {
        if (dbChannel.allowsSwearing) {
            // Add currency and let them go
            await db.add(`users.${message.author.id}.currency`,1)
        } else {
            let sussyWordsUsed = 0
            let slursUsed = 0
            let generalSwearsUsed = 0
            let content = message.content.replace("‍","") // You can't see it here - but replace Zero Width Joiners with whitespace so it can be flagged
            sussyWords.forEach(word=>{
                if (content.includes(word)&&dbChannel.blacklistedWords.includes(word)) {
                    sussyWordsUsed++
                }
            })
            racialSlurs.forEach(word=>{
                if (content.includes(word)&&dbChannel.blacklistedWords.includes(word)) {
                    slursUsed++
                }
            })
            generalSwears.forEach(word=>{
                if (content.includes(word)&&dbChannel.blacklistedWords.includes(word)) {
                    generalSwearsUsed++
                }
            })
            if (sussyWordsUsed+slursUsed+generalSwearsUsed == 0) {
                //- Message is clean.
                await db.add(`users.${message.author.id}.currency`,1)
            } else {
                message.author.send({embeds:[{
                    author: {
                        iconURL: message.guild.iconURL(),
                        name: `Used In ${message.guild.name}`
                    },
                    color: "RED",
                    title: "You can't say that!",
                    thumbnail: {
                        url: "https://i.imgur.com/lRLMhHw.png"
                    },
                    description: `The message you sent in \`${message.guild.name}\` was flagged for swearing.\n**${generalSwearsUsed?`${generalSwearsUsed} swears used\n`:""}${sussyWordsUsed?`${sussyWordsUsed} sus words used\n`:""}${slursUsed?`${slursUsed} racial slurs used\n`:""}**Punishment yet to be implemented...`
                }]})
                if (message.deletable) {
                    await message.delete()  
                }
            }
        }
    } else {
        await db.set(`channels.${message.channelId}.allowsSwearing`, false)
        await db.set(`channels.${message.channelId}.blacklistedWords`, [...require("./../utils/slurs.json"), ...require("./../utils/sussywords.json"), ...require("./../utils/swears.json")])
        messageCreate(message, db, client)
    }
}

//- stil watching?