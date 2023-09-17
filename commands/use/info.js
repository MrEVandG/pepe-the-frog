// echo.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get information on Pepe."),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
     */
    async execute(interaction, client, db, utils) {
        let mainnav = new discord.MessageActionRow({
            components: [new discord.MessageSelectMenu({
                customId: "mainnav",
                min_values: 1,
                max_values: 1,
                options: [
                    {
                        label: "Errors",
                        value: "errors",
                        description: "Got an error and wondering what it means?",
                        emoji: "📢",
                    },
                    {
                        label: "Typos",
                        value: "typos",
                        description: "Did I use the wrong image or mess up a word's spelling?",
                        emoji: "🔠"
                    }
                ]
            })]
        })
        let originalScriptFinished = false
        if (!originalScriptFinished) await interaction.reply({
            embeds: [new discord.MessageEmbed({
                title: "Information about Pepe the Frog",
                description: "Learn some sweet knowledge about me. Go ahead.",
                color: "DARK_GREEN"
            })], components: [mainnav]
        })

        let message = await interaction.fetchReply()
        originalScriptFinished = true
        interaction.channel.createMessageComponentCollector({ filter: i => i.message.id==message.id, time: 600000, componentType: "SELECT_MENU" }).on("collect", async int => {
            if (!int.replied) await int.update({ fetchReply: false })
            if (int.user.id!=interaction.user.id) return await int.followUp({ephemeral:true,content:"this select menu is not for u"});
            if (int.values[0] == "errors") {
                await interaction.editReply({
                    embeds: [new discord.MessageEmbed({
                        title: "Errors",
                        description: "Did Pepe the Frog suddenly freeze or not execute your command? You're probably experiencing an internal error, which only affects that single command. I(the developer) assure you that I'm either working on this error or taking a vacation. Whichever sounds more comfortable. 🌴",
                        color: "DARK_RED",
                        image: { url: "https://i.imgur.com/JLKP3Qc.png" }
                    })], components: [mainnav]
                })
            }
            if (int.values[0] == "typos") {
                await interaction.editReply({
                    embeds: [new discord.MessageEmbed({
                        title: "Typos",
                        description: "As a 12 year old with a family and an education, it's really easy to make a typo. If you can understand what it says, then you're probably fine, so don't ping me.",
                        color: "DARK_ORANGE",
                        image: {
                            url: "https://i.imgur.com/sn72JEK.png"
                        }
                    })], components: [mainnav]
                })
            }
        })
    }
}