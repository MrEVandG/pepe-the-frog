// inventory.js
// discord.js template
const discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Shows your inventory.")
        .addUserOption(u => u.setName("user").setDescription("this is who's inventory you're gonna look at")),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        let items = utils.items
        function fix(i) { return parseInt(i).toLocaleString() }
        const targetedUser = interaction.options.getUser("user") ?? interaction.user
        await db.failSafe(targetedUser)
        let userItems = await db.get(`users.${targetedUser.id}.items`)
        if (!Object.values(userItems??{}).length) {
            return await interaction.reply({
                embeds: [new discord.MessageEmbed({
                    author: {
                        iconURL: targetedUser.displayAvatarURL(),
                        name: targetedUser.tag + "'s Inventory"
                    },
                    description: targetedUser.tag + " does not have any items. Too bad for them!",
                    color: "DARK_RED"
                })]
            })
        }
        let inventoryArray = Object.keys(userItems).map(i => items.find(i2 => i == i2.item_id))
        Object.values(userItems).forEach((it, ix) => {
            if (!inventoryArray[ix]) return;
            if (it<1) return inventoryArray.splice(ix,1); // if the amount is less than 1, then remove the item from the array and do not show it at all.
            inventoryArray[ix].amount = it
        })
        let embed = new discord.MessageEmbed({
            author: {
                iconURL: targetedUser.displayAvatarURL(),
                name: targetedUser.tag + "'s Inventory"
            },
            description: `${targetedUser.tag}'s Inventory has ${inventoryArray.length} unique items in it.`,
            color: inventoryArray.length > 25 ? "DARK_BLUE" : "GREEN"
        })
        let fields = []
        inventoryArray.forEach(async item => {
            let price = item.canbesold ? ` ${await db.get("name")}${item.amount*item.price} ${await db.get("name")}${item.price}/item` : " Item cannot be sold."
            fields.push({name:`x${fix(item.amount)} ${typeof item.emoji == "object"?Object.values(item.emoji)[0]:item.emoji} ${item.name}`, value:`${item.description}${price}`,inline:false})
        })
        await new Promise(r=>setTimeout(r,100))
        embed.fields = fields
        return await interaction.reply({ embeds: [embed] })
    }
}