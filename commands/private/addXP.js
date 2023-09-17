// addXP.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addxp")
        .setDescription("Give someone some XP (in levels)")
        .addIntegerOption(i => i.setName("amount").setDescription("XP to add").setRequired(true))
        .addUserOption(u => u.setName("user").setDescription("User to add XP to").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
     */
    async execute(interaction, client, db, utils) {
        let items = utils.items
        if (interaction.guildId !== process.env.GUILD_ID) return await interaction.reply("You can't use this command in this guild")
        const amount = interaction.options.getInteger("amount")
        if (!amount) return await interaction.reply({
            embeds: [new discord.MessageEmbed({
                title: "Add XP",
                description: "You need to specify an amount of XP to add",
                color: "DARK_RED",
                footer: {
                    text: "You need to specify an amount of XP to add",
                    iconURL: "https://i.imgur.com/gOpzsBS.png"
                }
            })], ephemeral: true
        })
        const target = interaction.options.getUser("user") ?? interaction.user
        await db.add(`users.${target.id}.xp`,amount)
        const embed = new discord.MessageEmbed({
            author: {
                name: `Given by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            },
            title: "Add XP",
            description: `${target.tag} has been given ${amount.toLocaleString()} levels of XP.`,
            color: "GREEN",
            footer: {
                text: `Given to ${target.tag}`,
                iconURL: target.displayAvatarURL()
            }
        })
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
        // test for now, do not use
        if (target !== interaction.user) {
            /**@type {discord.Message}*/
            let dm;
            client.users.fetch(target.id, false).then(async user => {
                dm = await user.send({
                    content: "Hey check it out, a mod sent u smth(click X to hide):", embeds: [new discord.MessageEmbed({
                        title: "XP Given",
                        description: `Lucky you, ${interaction.user.tag} has given you ${amount.toLocaleString()} levels of XP.`,
                        color: "GREEN",
                        footer: {
                            text: `Given by ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }
                    })],
                    components: [new discord.MessageActionRow().addComponents(new discord.MessageButton({
                        emoji: "❌",
                        label: "Close",
                        customId: "close",
                        style: "SECONDARY",
                    }))]
                })
            }).then(async () => {
                // I need to make a listener for the message button
                const filter = (m) => m.customId === "close"
                const collector = dm.channel.createMessageComponentCollector({ filter, time: 30000 })
                collector.on("collect", async (m) => {
                    if (m.customId === "close") await dm.delete()
                })
            })
        }
    }
}