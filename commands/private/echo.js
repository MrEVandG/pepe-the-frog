// echo.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
// This command is just for fun! In my discord server there is an Ask Pepe and this command runs it!
module.exports = {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Pepe will repeat back to you what you tell him to.")
        .addStringOption(s=>s.setName("message").setDescription("The message to echo back.").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        if (!process.env.GODS.includes(interaction.user.id)) return;
        interaction.channel.send(interaction.options.getString("message"))
        interaction.reply({ephemeral:true,content:"Sent."})
    }
}