// clear.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear some messsages")
        .addIntegerOption(i => i.setName("amount").setDescription("Amount of messages to clear").setMinValue(1).setMaxValue(100)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        if (!interaction.member.permissions.has("MANAGE_MESSAGES")) return await interaction.reply({ content: "You do not have permission to use this command on this server.", ephemeral: true })
        const amount = interaction.options.getInteger("amount") ?? 100
        if (amount <= 100 && amount >= 1) {
            await interaction.channel.bulkDelete(amount, true)
            return await interaction.reply({ content: `Cleared ${amount} messages`, ephemeral: true })
        }
    }
}