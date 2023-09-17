// fish.js
// discord.js template
const discord = require("discord.js")
const {SlashCommandBuilder} = require("@discordjs/builders")
const quickdb = require("quick.db")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("fish")
        .setDescription("A grind command that lets you fish for... fish."),
    /**
     * 
     * @param {discord.CommandInteraction} interaction 
     * @param {discord.Client} client 
     * @param {quickdb.QuickDB} db 
     * @param {Object.prototype} utils 
     */
    async execute(interaction, client, db, utils) {
        let currentRod = await db.get(`users.${interaction.user.id}.selectedfishingrod`)
        let rodEmoji = utils.items.find(i=>i.item_id==(currentRod))??":question:"
        let inventory = await db.get(`users.${interaction.user.id}.items`)
        let rods = []
        Object.keys(inventory).forEach((item,index)=>{ // this mess loops over every item in the user's inventory and puts every fishing rod in the "rods" array.
            if (item.includes("fishingrod")&&Object.values(inventory)[index]>0) rods.push(item)
        })
        let buttons = []
        if (currentRod&&rods.length>0) buttons.push(new discord.MessageButton({
            label: `${rodEmoji}Cast Line`,
            customId: "cast",
            style: "SUCCESS",
        }))
        if (rods.length>0&&!currentRod) buttons.push(new discord.MessageButton({
            label: "Pick a Rod",
            customId: "pickrod",
            style: "SECONDARY"
        }))
        let options = {embeds:[new discord.MessageEmbed({
            title: "Go Fishing",
            description: rods.length>0?`${rodEmoji}\n\n\n:ocean::ocean::ocean::ocean::ocean:`:"You have no fishing rods in your inventory. Buy one from the shop and come back here. </shop:1054798487239266363>"
        })]}
        if (buttons.length>0) {
            options.components = [new discord.MessageActionRow({components:buttons})]
        }
        await interaction.reply(options)
        // damn, all that just for one little teensy-weensy menu...
    }
}