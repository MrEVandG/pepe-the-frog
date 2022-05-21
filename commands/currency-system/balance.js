// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your balance")
        .addUserOption(u => u.setName("user").setDescription("User to get the balance of").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, currency, users, currencyShop) {
        const target = interaction.options.getUser("user") ?? interaction.user
        const userId = target.id
        const balance = currency.getBalance(userId)
        const embed = new discord.MessageEmbed()
            .setTitle("Balance")
            .setDescription(`${target.tag} has ${currency.name}${parseInt(balance).toLocaleString()}`)
            .setColor("GREEN")
            .setFooter({text:target.tag,iconURL:target.displayAvatarURL()})
        interaction.reply({embeds:[embed]})
    }
}