const discord = require("discord.js")
const JSONdb = require('simple-json-db')
/**
 * @param {discord.CommandInteraction} interaction 
 * @param {discord.Client} client 
 * @param {JSONdb} db
 */
module.exports = async (interaction, client, db) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        try {
            await command.execute(interaction, client, db)
        } catch (err) {
            if (interaction.replied || interaction.deferred) interaction.editReply("The code errored")
            else interaction.reply("The code errored")
            console.log(err)
        }
    }
}
