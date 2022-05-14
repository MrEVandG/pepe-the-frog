// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("adventure")
        .setDescription("Choose an adventure."),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply()
        const row = new discord.MessageActionRow()
            .addComponents(new discord.MessageSelectMenu({
                customId: "adventure",
                options: [{
                    label: "Space",
                    description: "You are going to space to replace that American flag with your own."
                }]
            }))

        const embed = new discord.MessageEmbed({
            title: "Adventure",
            description: "Space",
            color: "GREEN",
            author: {
                name: `${interaction.user.tag} is going on an adventure`,
                iconURL: interaction.user.displayAvatarURL()
            }
        })
        await interaction.reply({ embeds: [embed] })
    }
}