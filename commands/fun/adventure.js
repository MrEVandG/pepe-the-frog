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
        let chose = false
        const row = new discord.MessageActionRow()
            .addComponents(new discord.MessageSelectMenu({
                customId: "adventure",
                placeholder: "Choose an adventure",
                options: [{
                    label: "Space",
                    description: "You are going to space to replace that American flag with your own.",
                    value: "space"
                }]
            }))

        const embed = new discord.MessageEmbed({
            title: "Adventure",
            description: "Choose an adventure to go on",
            color: "GREEN",
            author: {
                name: `${interaction.user.tag} is going on an adventure`,
                iconURL: interaction.user.displayAvatarURL()
            }
        })
        await interaction.editReply({ embeds: [embed], components: [row] })

        const filter = (m) => m.user.id === interaction.user.id
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 10 * 1000, componentType: "SELECT_MENU" }) // gives the user 60 seconds to choose and play
        /**@param {discord.SelectMenuInteraction} m*/
        collector.on("collect", async (m) => {
            m.deferUpdate()
            if (m.user.id === interaction.user.id) {
                chose = true
                if (m.customId === "adventure") {
                    if (m.values[0] === "space") {
                        const buttonRow = new discord.MessageActionRow()
                            .addComponents(new discord.MessageButton({
                                cusotmId: "start",
                                emoji: "🚀",
                                label: "Launch",
                                style: "SECONDARY",
                            }))
                        embed.setDescription("You are going to space to replace that American flag with your own.")
                        embed.setTitle("Space")
                        embed.setImage("https://i.imgur.com/87Yojbq.png")
                        // set color to a dark, spacy blue
                        embed.setColor("#1E1559")
                        await interaction.editReply({ embeds: [embed] })
                    }
                }
            }
        })
        collector.on("end", async (collected) => {
            console.log("Ended")
            row.components[0].disabled = true
            let options = { embeds: [embed], components: [row] }
            if (!chose) options.content = "alright then, i guess you'll be missing that sweet adventure"
            await interaction.editReply(options)
        })
    }
}