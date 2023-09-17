// echo.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
// This command is just for fun! In my discord server there is an Ask Pepe and this command runs it!
module.exports = {
    data: new SlashCommandBuilder()
        .setName("dm")
        .setDescription("Pepe will forward your message to someone.")
        .addUserOption(u => u.setName("user").setDescription("User to send messages to").setRequired(true))
        .addStringOption(s => s.setName("message").setDescription("The message to send").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        if (interaction.guildId != process.env.GUILD_ID) return await interaction.reply("You don't have the permissions to do this, because you are not authorized to use it on this server")
        let embed = new discord.MessageEmbed({ title: "Forwarded Message", author: { iconURL: interaction.user.displayAvatarURL(), name: "Forwarded from " + interaction.user.tag }, color: "DARK_GREEN", description: interaction.options.getString("message") })

        interaction.options.getUser("user").send({embeds: [embed]})
        interaction.reply({ ephemeral: true, content: "Sent. This is what it looks like for " + interaction.options.getUser("user").tag + ":",embeds:[embed]})
    }
}