// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Visualize any color by hex, rgb, hsv, or hsl(nobody cares about cmyk)")
        .addStringOption(s => s.setName("color").setDescription("Color to visualize").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client) {
        // we have to see if the string is a hex code. everything else will not be used
        const color = interaction.options.getString("color")
        const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
        if (!color.match(hexRegex)) interaction.reply("This color value does not seem to be a valid hex code. Either translate it or add a # symbol to the beginning")
        const embed = new discord.MessageEmbed({
            title: "Color Visualizer",
            description: `Visualizing the color ${color}`,
            color: color
        })
        interaction.reply({embeds:[embed]})
    }
}