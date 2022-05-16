// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("crash")
        .setDescription("Crash the bot"),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db) {
        if (interaction.guildId===process.env.GUILD_ID) return await interaction.reply("You don't have the permissions to do this, because you are not authorized to use it on this server")
        client.destroy()
    }
}