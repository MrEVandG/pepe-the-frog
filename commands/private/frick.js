// frick.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const { QuickDB } = require("quick.db")
const fricklog = new discord.WebhookClient({url:process.env.FRICKLOG,token:process.env.FRICKLOGTOKEN})
module.exports = {
    data: new SlashCommandBuilder()
        .setName("frick")
        .setDescription("Frick someone. permissionally, or not...")
        .addUserOption(u => u.setName("user").setDescription("User to frick").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {QuickDB} db
     */
    async execute(interaction, client, db, utils) {
        new Promise(async () => {
            let items = utils.items
            // get the user they chose
            const target = interaction.options.getUser("user")
            if (target.id == interaction.user.id) {
                return await interaction.reply({
                    embeds: [new discord.MessageEmbed({
                        title: "Don't Do What Others Say",
                        description: "Don't do what your friends tell you to do... especially fricking yourself",
                        color: "DARK_RED"
                    })]
                })
            }
            if (target.bot) {
                return await interaction.reply({
                    embeds: [new discord.MessageEmbed({
                        title: "Don't Frick Bots",
                        description: "How dare you even THINK to touch my kind",
                        color: "DARK_RED"
                    })]
                })
            }
            // dm the user for permission
            const row = new discord.MessageActionRow()
            row.addComponents(new discord.MessageButton({
                customId: "accept-frick",
                label: "Accept",
                style: "SUCCESS",
                emoji: "✅"
            }), new discord.MessageButton({
                customId: "deny-frick",
                label: "Deny",
                style: "DANGER",
                emoji: "❌"
            }))
            const dm = await target.send({
                embeds: [new discord.MessageEmbed({
                    title: "Frick",
                    description: `${interaction.user.tag} wants to frick you. Do you accept?`,
                    color: "DARK_GREEN",
                    footer: {
                        text: "You have 30 seconds to accept or deny. If you do not respond, this will automatically be denied.",
                        iconURL: interaction.user.displayAvatarURL()
                    }
                })],
                components: [row]
            })
            await interaction.reply({
                embeds: [new discord.MessageEmbed({
                    title: "Frick",
                    description: `Frick request sent to ${target.tag}`,
                    color: "DARK_GREEN"
                })], ephemeral: true
            })
            const collector = dm.createMessageComponentCollector({ time: 30 * 1000, max: 1 })
            collector.on("collect", collect => {
                if (collect.customId === "deny-frick") {
                    collector.stop("denied")
                }
                if (collect.customId === "accept-frick") {
                    collector.stop("accepted")
                    const embed = new discord.MessageEmbed({
                        title: "Frick",
                        description: `${interaction.user.tag} fricked ${target.tag} :milk:`,
                        color: "DARK_RED",
                        author: {
                            name: `frick request sent by ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        },
                        footer: {
                            text: `frick request sent to ${target.tag}`,
                            iconURL: target.displayAvatarURL()
                        }
                    })
                    // send the request to the fricklog and the server
                    //? saving the frick to the server is only for developers to see and use for statistics-
                    //? the frick numbers in the servers should not be available to anyone who uses the bot.
                    fricklog.send({embeds:[embed]})
                    dm.edit({ embeds: [embed], components: []})
                    db.add(`users.${interaction.user.id}.random.fricks`,1)
                    interaction.editReply({ embeds: [embed] })
                }
            }).on("end", async (collected, reason) => {
                if (reason=="denied") {
                    await interaction.editReply({
                        embeds: [new discord.MessageEmbed({
                            title: "Permission Denied",
                            description: `Your request to frick \`${target.username}\` was denied.`, color: "DARK_RED", author: {
                                name: `frick request sent by ${interaction.user.tag}`,
                                iconURL: interaction.user.displayAvatarURL()
                            },
                            footer: {
                                text: `frick request sent to ${target.tag}`,
                                iconURL: target.displayAvatarURL()
                            }
                        })], ephemeral: true
                    })
                } else if (reason=="time") {
                    await interaction.editReply({
                        embeds: [new discord.MessageEmbed({
                            title: "Permission Denied",
                            description: `Your request to frick \`${target.username}\` was timedout.`, color: "DARK_RED", author: {
                                name: `frick request sent by ${interaction.user.tag}`,
                                iconURL: interaction.user.displayAvatarURL()
                            },
                            footer: {
                                text: `frick request sent to \`${target.username}\``,
                                iconURL: target.displayAvatarURL()
                            }
                        })], ephemeral: true
                    })
                }
            })
        }).catch(err=>client.emit("error",err))
    }
}