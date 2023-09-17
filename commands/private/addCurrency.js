// addCurrency.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addcurrency")
        .setDescription("Add money to someone")
        .addIntegerOption(i => i.setName("amount").setDescription("Amount of money to add").setRequired(true))
        .addUserOption(u => u.setName("user").setDescription("User to add money to").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
     */
    async execute(interaction, client, db, utils) {
        if (interaction.guildId !== process.env.GUILD_ID) return await interaction.reply({ephemeral:true,content:"You can't use this command in this guild"})
        if (!process.env.GODS.includes(interaction.user.id)) {
            return await interaction.reply({ephemeral:true,content:"You are not cool enough to do that buddy boy"})
        }
        const amount = interaction.options.getInteger("amount")
        if (!amount) return await interaction.reply({
            embeds: [new discord.MessageEmbed({
                title: "Add Currency",
                description: "You need to specify an amount of money to add",
                color: "DARK_RED",
                footer: {
                    text: "You need to specify an amount of money to add",
                    iconURL: "https://i.imgur.com/gOpzsBS.png"
                }
            })], ephemeral: true
        })
        const target = interaction.options.getUser("user") ?? interaction.user
        await db.add(`users.${target.id}.currency`, amount)
        const embed = amount>0?new discord.MessageEmbed({
            title: "Add Currency",
            description: `${target.tag} has been given ${await db.get("name")}${amount.toLocaleString()}`,
            color: "GREEN",
            footer: {
                text: `Given to ${target.tag}`,
                iconURL: target.displayAvatarURL()
            }
        }):new discord.MessageEmbed({
            title: "Currency Removed",
            description: `You took ${await db.get("name")}${Math.abs(amount).toLocaleString()} from ${target.tag}. Rude!`,
            color: "RED",
            footer: {
                text: `Taken from ${target.tag}`,
                iconURL: target.displayAvatarURL()
            }
        })
        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
        // test for now, do not use
        if (target !== interaction.user) {
            /**@type {discord.Message}*/
            let dm;
            client.users.fetch(target.id, false).then(async user => {
                dm = await user.send({
                    content: "Hey check it out, a mod sent u smth(click X to hide):", embeds: [amount>0?new discord.MessageEmbed({
                        title: "Currency Given",
                        description: `Lucky you, ${interaction.user.tag} has given you ${await db.get("name")}${amount.toLocaleString()}`,
                        color: "GREEN",
                        footer: {
                            text: `Given by ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }
                    }):new discord.MessageEmbed({
                        title: "Currency Removed",
                        description: `Unconveniently for you, ${interaction.user.tag} has taken ${await db.get("name")}${Math.abs(amount).toLocaleString()} from you!`,
                        color: "RED",
                        footer: {
                            text: `Taken by ${interaction.user.tag}`,
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
                    if (m.customId === "close") await dm.delete().catch(m.followUp("There was an error trying to close the message so uh it's here to say. :/"))
                })
            })
        }
    }
}