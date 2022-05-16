const discord = require("discord.js")
/**
 * @param {discord.CommandInteraction} interaction 
 * @param {discord.Client} client 
 */
module.exports = async (interaction, client, currency, users, currencyShop) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        try {
            await command.execute(interaction, client, currency, users, currencyShop)
        } catch (err) {
            if (interaction.replied || interaction.deferred) interaction.editReply("The code errored")
            else interaction.reply("The code errored")
            console.log(err)
        }
    }
}
