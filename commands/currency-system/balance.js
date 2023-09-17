// balance.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your balance")
        .addUserOption(u => u.setName("user").setDescription("User to get the balance of").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
     */
    async execute(interaction, client, db, utils) {
        function fix(i) {return parseInt(i).toLocaleString()}
        let items = utils.items
        const target = interaction.options.getUser("user") ?? interaction.user
        const userId = target.id
        await db.failSafe(target)
        const balance = await db.get(`users.${target.id}.currency`)
        const xp = await db.get(`users.${interaction.user.id}.xp`)
        const gods = JSON.parse(process.env.GODS).map(i => i.toString())
        const embed = new discord.MessageEmbed()
            .setTitle("Balance")
            .setDescription(`${target.tag} has ${await db.get("name")}${fix(balance)} and ${fix(xp)} XP`)
            .setColor("GREEN")
            .setFooter({ text: target.tag, iconURL: target.displayAvatarURL() })
        if (gods.find(i => i == userId)) {
            //! Gods
            //* If a non-god gets a god's balance, it won't work.
            //* If a non-god gets a public non-god's balance, it will work
            //* If a non-god gets a private non-god's balance, it won't work
            //* If a god gets a anyone's balance, including a god's, it will work
            if (gods.find(i => i == interaction.user.id)) {
                return await interaction.reply({ embeds: [embed], ephemeral: true })
            }
            return await interaction.reply({ embeds: [embed.setDescription(target.username + " is a god, therefore his financial status cannot be revealed.")] })
        }
        return await interaction.reply({ embeds: [embed] })
    }
}