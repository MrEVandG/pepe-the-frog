// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("frick")
        .setDescription("Frick someone. permissionally, or not...")
        .addUserOption(u => u.setName("user").setDescription("User to frick").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, currency, users, currencyShop) {
        // get the user they chose
        const target = interaction.options.getUser("user")
        if (target == interaction.user) {
            return await interaction.reply({
                embeds: [new discord.MessageEmbed({
                    title: "Don't Do What Others Say",
                    description: "Don't do what your friends tell you to do... especially hecking yourself",
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
                    text: "You have 30 seconds to accept or deny. If you do not reply, this will automatically be denied.",
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
        const newRow = new discord.MessageActionRow().addComponents(new discord.MessageButton({ customId: "close", emoji: "❌", label: "Close", style: "SECONDARY" }))
        collector.on("collect", collect => {
            if (collect.customId === "deny-frick") {
                collector.stop("denied")
            }
            if (collect.customId === "accept-frick") {
                collector.stop("accepted")
                // generate random outcomes
                const outcomes = [
                    "now you have an sti. better pay for it.",
                    "the baby died.",
                    "you moan so loud she left you.",
                    "you asked to stop, but she didn't listen.",
                    "it turns out, she wasn't human. now what?",
                ]
                const stis = [
                    "Chlamydia",
                    "Genital herpes",
                    "Gonorrhea",
                    "HIV/AIDS",
                    "HPV",
                    "Pubic lice",
                    "Syphilis",
                    "Trichomoniasis"
                ]
                const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]
                const embed = new discord.MessageEmbed({
                    title: "Frick",
                    description: `${interaction.user.tag} fricked ${target.tag} and ${outcome}`,
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
                target.send({embeds:[embed]})
                interaction.editReply({embeds:[embed]})
            }
        })
        collector.on("end", collected => {
            const newCollector = dm.createMessageComponentCollector({ time: 30000, max: 1 })
            dm.edit({ content: "Permission denied. Press X to close this message.", components: [newRow] })
            newCollector.on("collect", collect => {
                if (collect.customId == "close") {
                    dm.delete()
                }
            })
            newCollector.on("end", collected => {
                dm.delete()
            })
        })
    }
}