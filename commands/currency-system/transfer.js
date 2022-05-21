// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transfercurrency")
        .setDescription("Transfer currency between you and another user")
        .addIntegerOption(i => i.setName("amount").setDescription("Amount of currency to transfer").setRequired(true))
        .addUserOption(u => u.setName("user").setDescription("User to transfer the currency to").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {discord.Collection} currency
     */
    async execute(interaction, client, currency, users, currencyShop) {
        const amount = Math.abs(interaction.options.getInteger("amount"))
        const target = interaction.options.getUser("user")
        const userId = target.id
        const balance = currency.getBalance(userId)
        if (amount > balance) return await interaction.reply({embeds:[new discord.MessageEmbed({
            title: "Transfer Currency",
            description: `You don't have enough to transfer ${currency.name}${amount}.`,
            color: "DARK_RED",
        })],ephemeral:true})
        currency.add(interaction.user.id, -amount)
        currency.add(userId, amount)
        const embed = new discord.MessageEmbed()
            .setTitle("Transfer Currency")
            .setDescription(`You transferred ${currency.name}${amount} to ${target.tag}.`)
            .setColor("GREEN")
            .setFooter({text:interaction.user.tag,iconURL:interaction.user.displayAvatarURL()})
        interaction.reply({embeds:[embed]})
    }
}