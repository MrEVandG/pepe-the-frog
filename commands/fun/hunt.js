// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hunt")
        .setDescription("Enter... somewhere and hunt something"),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db) {
        // command not implemented
        return await interaction.reply({embeds:[new discord.MessageEmbed({
            title: "Hunt",
            description: "The hunt command is not fully complete yet.",
            color: "DARK_RED",
            footer: {
                text: "This command is not fully complete yet.",
                iconURL:"https://i.imgur.com/gOpzsBS.png"
            }
        })]})
    }
}