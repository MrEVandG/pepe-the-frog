// addItem.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")
const items = require("../../utils/items.json")
let orderedItemList = items.sort((a,b)=>a.name<b.name?-1:1)
let string
let example = {
    data: new SlashCommandBuilder()
        .setName("additem")
        .setDescription("Adds an item to any user's inventory.")
        .addStringOption(s => {
            string = s.setName("item").setDescription("The item to add").setRequired(true)
            return s
        })
        .addIntegerOption(i=>i.setName("amount").setDescription("The amount of items to add.").setRequired(false))
        .addUserOption(u=>u.setName("user").setDescription("The user to give the item to.").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
    */
    async execute(interaction, client, db, utils) {
        let items = utils.items
        const itemID = interaction.options.getString("item")
        const amount = interaction.options.getInteger("amount") ?? 1
        const target = interaction.options.getUser("user") ?? interaction.user
        const item = await items.find(item => item.item_id === itemID)
        await db.add(`users.${target.id}.items.${itemID}`, amount)
        return await interaction.reply({ embeds: [new discord.MessageEmbed({
            title: "Added Item",
            description: `${target.tag} has been given x${amount.toLocaleString()} ${item.emoji}\`${item.name}\``,
            color: "GREEN",
            footer: {
                text: `Given to ${target.tag}`,
                iconURL: target.displayAvatarURL()
            }
        })], ephemeral: true })
    }
}

orderedItemList.map(item => { return { name: item.name, value: item.item_id } }).forEach(i => {
    string.addChoices(i)
})
module.exports = example