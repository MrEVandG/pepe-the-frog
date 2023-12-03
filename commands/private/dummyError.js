// dummyError.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("error")
        .setDescription("Pepe will format and send a fake error to the error log channel.")
        .addStringOption(s => s.setName("error").setDescription("The error message to send").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        if (interaction.guildId != process.env.GUILD_ID) return await interaction.reply("You don't have the permissions to do this, because you are not authorized to use it on this server")
        client.emit("error",interaction.options.getString("error"))
        interaction.reply({ephemeral:true,content:"Sent. Make sure the other devs know this error is fake!!!"})
    }
}