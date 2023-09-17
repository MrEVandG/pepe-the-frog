// item.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")
const items = require("../../utils/items.json")
let orderedItemList = items.sort((a,b)=>a.name<b.name?-1:1)
let string
let example = {
    data: new SlashCommandBuilder()
        .setName("item")
        .setDescription("Look at an item.")
        .addStringOption(s => {
            string = s.setName("item").setDescription("The item to use").setRequired(true)
            return s
        }),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
    */
    async execute(interaction, client, db, utils) {
        let item = utils.items.find(i=>i.item_id==interaction.options.getString("item"))
        // if item can be bought but not sold, say Buy
        // if item can be sold but not bought, say Sell
        // if item can be bought and sold, say Buy/Sell
        // and store it in a variable
        const buySell = item.inshop && item.canbesold ? "Buy/Sell" : item.inshop ? "Buy" : item.canbesold ? "Sell" : "None"
        const fields = [
            {
                name: "Purchasable in shop",
                value: item.inshop ? "Yes" : "No",
                inline: true
            },
            {
                name: buySell == "None" ? "Price" : `${buySell} Price`,
                value: buySell == "None" ? "Item is not buyable or sellable" : `\`${item?.price?.toLocaleString()??item?.price?item?.price?.toLocaleString()??item?.price:"No Price"}\``, // i couldn't tell you what i was on when i made this line of code but damn it's impossible to read
                inline: true
            },
            {
                name: "Rarity and Type",
                value: `${item.rarity[0].toUpperCase()}${item.rarity.slice(1)} ${item.type.map(type=>type[0].toUpperCase()+type.slice(1)).join(", ")}`,
                inline: true
            }
        ]
        await new Promise(resolve => setTimeout(resolve, 10))
        const imageURL = `https://cdn.discordapp.com/emojis/${item.emoji.split(":")[2].slice(0,-1)}.${item.emoji.includes("<a:") ? "gif" : "webp"}?size=128&quality=lossless`
        const embed = new discord.MessageEmbed({
            title: item.name,
            description: item.longdescription,
            color: "GREEN",
            thumbnail: {
                url: imageURL,
                width: 1024,
                height: 1024
            },
            fields
        })

        await interaction.reply({ embeds: [embed] })
    }
}

orderedItemList.map(item => { return { name: item.name, value: item.item_id } }).forEach(i => {
    string.addChoices(i)
})
module.exports = example