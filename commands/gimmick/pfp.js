//pfp.js
//discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("profilepicture")
        .setDescription("Get the profile picture of a user.")
        .addUserOption(user =>
            user.setName("user")
                .setDescription("Who's PFP do I get?")
                .setRequired(true)
        ),
    /**
     *The main execute function of any slash command.
     *
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
     * @param {object} utils
     */

    async execute(interaction, client, db, utils) {
        /**
         * @type {discord.User}
         */
        let user = interaction.options.getUser("user")
        interaction.reply({
            ephemeral: true, embeds: [new discord.MessageEmbed({
                color: "RED",
                title: "User Profile Picture",
                description: `${user.username}'s profile picture link is ${user.avatarURL()}`,
                image: {
                    url: user.avatarURL()
                }
            })]
        })
    }

}