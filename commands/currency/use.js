// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("use")
        .setDescription("Use an item")
        .addStringOption(s => s.setName("itemid").setDescription("ID of the item to use").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {discord.Collection} currency
     */
    async execute(interaction, client, currency, users, currencyShop) {
        const itemID = interaction.options.getString("itemid")
        const userID = interaction.user.id
        const userItems = await users.findOne({ where: { user_id: userID } }).getItems()
    }
}