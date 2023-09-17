// ping.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pong!"),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        let items = utils.items
        const embed = new discord.MessageEmbed({
            author: {
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL()
            },
            color: "#0099ff",
            description: `Pong! :ping_pong: The webserver ping was ${client.ws.ping}`
        })
        await interaction.reply({ embeds: [embed] })
    }
}