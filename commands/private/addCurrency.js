// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const Users = require("../../models/Users")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addcurrency")
        .setDescription("Add money to someone")
        .addIntegerOption(i => i.setName("amount").setDescription("Amount of money to add").setRequired(true))
        .addUserOption(u => u.setName("user").setDescription("User to add money to").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {discord.Collection} currency
     */
    async execute(interaction, client, currency, users, currencyShop) {
        if (interaction.guildId !== process.env.GUILD_ID) return await interaction.reply("You can't use this command in this guild")
        const amount = interaction.options.getInteger("amount")
        if (!amount) return await interaction.reply({
            embeds: [new discord.MessageEmbed({
                title: "Add Currency",
                description: "You need to specify an amount of money to add",
                color: "DARK_RED",
                footer: {
                    text: "You need to specify an amount of money to add",
                    iconURL: "https://imgur.com/gOpzsBS"
                }
            })], ephemeral: true
        })
        const target = interaction.options.getUser("user") ?? interaction.user
        await currency.add(target.id, amount)
        const embed = new discord.MessageEmbed({
            author: {
                name: `Given by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            },
            title: "Add Currency",
            description: `${target.tag} has been given ${currency.name}${amount.toLocaleString()}`,
            color: "GREEN",
            footer: {
                text: `Given to ${target.tag}`,
                iconURL: target.displayAvatarURL()
            }
        })
        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
        if (target == interaction.user) {
            /**@type {discord.Message}*/
            let dm;
            client.users.fetch(target.id, false).then(async user => {
                dm = await user.send({
                    content: "Hey check it out, a mod sent u smth(click X to hide):", embeds: [new discord.MessageEmbed({
                        title: "Currency Given",
                        description: `Lucky you, ${interaction.user.tag} has given you ${currency.name}${amount.toLocaleString()}`,
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