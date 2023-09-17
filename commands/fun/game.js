const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const { QuickDB } = require("quick.db")

module.exports = {
    data: new SlashCommandBuilder().setName("game").setDescription("Play a game.")
    .addSubcommand(sc=>sc.setName("sokoban").setDescription("Play sokoban.")),
    /**
     * 
     * @param {discord.CommandInteraction} interaction 
     * @param {discord.Client} client 
     * @param {QuickDB} db 
     */
    async execute(interaction, client, db, utils) {
        let game = interaction.options.getSubcommand()
        if (game === "sokoban") {
            interaction.reply({embeds:[new discord.MessageEmbed({
                author: {
                    iconURL: interaction.user.displayAvatarURL(),
                    name: interaction.user.username
                },
                color: "RED",
                title: "no u",
                description: "not implemented yet, i found motivation somewhere else :))))"
            })]})
        }
    }
}