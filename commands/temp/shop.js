//shop.js
//discord.js template
const discord = require("discord.js")
const quickdb = require("quick.db")
const { SlashCommandBuilder } = require("@discordjs/builders")
const items = require("../../index").utils.items

module.exports = {
    data: new SlashCommandBuilder()
        .addSubcommand(sc => sc.setName("list").setDescription("List all available items for purchase."))
        .addSubcommand(sc => sc.setName("buy").setDescription("Buy an item.").addStringOption(s => s.setName("item").setDescription("The item you'd like to buy.").addChoices(items.map(item => { return { name: item.name, value: item.item_id } })))),
    /**
     *The main execute function of any slash command.
     *
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
     * @param {object} utils
     */

    // RIP old shop command, you won't be missed (because you suck.)
    async execute(interaction, client, db, utils) {
        if (interaction.options.getSubcommand()=="buy") {

        }
        else if (interaction.options.getSubcommand()=="list") {
            
        }
    }

}