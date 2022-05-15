// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your balance")
        .addUserOption(u=>u.setName("user").setDescription("User to get the balance of").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db) {
        const userId = interaction.options.getUser("user").id ?? interaction.user.id
        const userData = await db.get("users").find({id:user.id})
        if (!userData) return interaction.reply("You don't have a balance yet! Type `.register` to register your account.")
        const balance = userData.balance
        const embed = new discord.MessageEmbed()
            .setTitle("Balance")
            .setDescription("You have **"+balance+"**")
            .setColor("GREEN")
        interaction.reply(embed)
    }
}
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Register yourself"),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db) {
        const user = interaction.author
        const guild = interaction.guild
        const userData = await db.get("users").find({id:user.id})
        if (userData) return interaction.reply("You already have a balance!")
        await db.get("users").push({id:user.id, balance:0})
        interaction.reply("You have been registered and have been given a balance of 0")
    }
}
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .