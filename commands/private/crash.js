// crash.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("crash")
        .setDescription("Crash the bot. Only if you have perms.")
        .addStringOption(s=>s.setName("message").setDescription("Add a message or a reason to why you killed the bot. Leave empty for no message.").setRequired(false)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        if (!interaction.guildId == process.env.GUILD_ID) return await interaction.reply("You don't have the permissions to do this, because you are not authorized to use it on this server")
        let reason = interaction.options.getString("message").trim()
        if(!process.env.GODS.includes(interaction.user.id)) {
            client.warningWebhook.send({embeds:[{
                title: "Attempted Murder",
                description: reason||"No reason provided."
            }]})
            return interaction.reply({ephemeral:true,content:"hey man don't do that :sob:"})
        }
        if (reason) {
            interaction.reply({embeds:[{
                title: "Bot Shut Down",
                description: reason||"This is weird. Why did this if statement run if there was no reason provided? Time to tell the creator."
            }]})
        } else {
            interaction.reply({ephemeral:true,embeds:[new discord.MessageEmbed({
                color: "DARK_RED",
                title: "Bot Killed",
                description: "Me, the bot, will be shutting down now. No reason was provided. Also only you can see this message but if you wanted to provide one you're doomed."
            })]})
        }
        client.emit("debug","send-all-heartbeats")
        client.warningWebhook.send({embeds:[new discord.MessageEmbed({
            color: "PURPLE",
            title: "Bot killed",
            description: `<@${interaction.user.id}> ran </crash:974454282474643466> and now I am dead! They better have a good reaosn.`
        })]})
        console.log("🟣 Bot shutting down...")
        client.destroy() // Rest in peace.
        console.log("🟣 Client destroyed.")
    }
}