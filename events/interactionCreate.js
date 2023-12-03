const discord = require("discord.js")
/**
 * @param {discord.Interaction} interaction 
 * @param {discord.Client} client 
 */

module.exports = async (interaction, client, db, utils) => {
    await db.failSafe(interaction.user.id)
    if (interaction.isAutocomplete()) {
        /**
         * @type {discord.AutocompleteInteraction}
         */
        let autocompleteInteraction = interaction
        const command = client.commands.get(interaction.commandName)
        if (!command) return;
        if (!command?.autocomplete) return;
        try {
            await command.autocomplete(autocompleteInteraction, client, db, utils)
        } catch (err) {
            client.emit("error",err) // send the error to the webhook
        }

    } else if (interaction.isCommand() || interaction.isContextMenu()) { // Normal slash commands and Context Menus (right-click menu) are luckily ran the same way :D
        const command = client.commands.get(interaction.commandName)
        if (!command) return await interaction.reply({embeds:[new discord.MessageEmbed({description:"The command does not exist or cannot be found."})]})
        try {
            await command.execute(interaction, client, db, utils)
        } catch (err) {
            let errorEmbed = new discord.MessageEmbed({
                title: "Error!",
                description: `I could not execute your command because of an error. The developers have already been notified about this issue.`,
                color: "RED"
            })
            if (interaction.replied) {
                if (!(await interaction.fetchReply())) {
                    await interaction.followUp({embeds:[errorEmbed]})
                }
            }
            if (interaction.replied || interaction.deferred) interaction.editReply({embeds:[errorEmbed],components:[],content:"\u200d"})
            else interaction.reply({embeds:[errorEmbed],components:[],content:"\u200d"}) // Unicode character "Zero Width Joiner", used for combining emojis, is luckily invisible.
            client.emit("error",err)
        }
    }
}
