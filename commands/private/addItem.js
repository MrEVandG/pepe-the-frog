// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("additem")
        .setDescription("Add an item to a user, or yourself.")
        .addStringOption(s=>s.setName("itemid").setDescription("ID of the item to add").setRequired(true))
        .addIntegerOption(i=>i.setName("amount").setDescription("Amount of the item to add").setRequired(false))
        .addUserOption(u=>u.setName("user").setDescription("User to add the item to").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {discord.Collection} currency
    */
    async execute(interaction, client, currency, users, currencyShop) {
        if (interaction.guildId !== process.env.GUILD_ID) return await interaction.reply("You can't use this command in this guild")
        const itemID = interaction.options.getString("itemid")
        if (!itemID) return await interaction.reply({embeds:[new discord.MessageEmbed({
            title: "Add Item",
            description: "What kind of thing am I adding if you don't even tell me the item?",
            color: "DARK_RED",
        })],ephemeral:true})
        const amount = interaction.options.getInteger("amount") ?? 1
        const target = interaction.options.getUser("user") ?? interaction.user
        const item = await currencyShop.findOne({ where: { item_id: itemID } })
        if (!item) return await interaction.reply({embeds:[new discord.MessageEmbed({
            title: "Add Item",
            description: "I don't think that item exists bro",
            color: "DARK_RED",
        })],ephemeral:true})
        const user = await users.findOne({ where: { user_id: target.id } })
        user?.addItem(itemID, amount)
        const embed = new discord.MessageEmbed({
            title: "Added Item",
            description: `${target.tag} has been given x${amount.toLocaleString()} ${item.emoji}\`${item.name}\``,
            color: "GREEN",
            footer: {
                text: `Given to ${target.tag}`,
                iconURL: target.displayAvatarURL()
            }
        })
        return await interaction.reply({embeds:[embed],ephemeral:true}) 
    }
}