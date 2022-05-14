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
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60_000, componentType: "SELECT_MENU" }) // gives the user 60 seconds to choose and play
        /**@param {discord.SelectMenuInteraction} m*/
        collector.on("collect", async (m) => {
            console.log(m.values)
            m.deferUpdate()
            if (m.user.id===interaction.user.id) {
                m.update({content: "bean"})
                chose = true
                if (m.customId==="adventure") {
                    if (m.value==="space") {
                        await interaction.editReply("You are going to space to replace that American flag with your own.")
                    }
                }
            }
        })
        collector.on("end", async (collected) => {
            if (!chose) await interaction.editReply("You did not choose a choice in time.")
        })
    }
}