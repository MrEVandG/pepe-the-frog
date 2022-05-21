// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("use")
        .setDescription("Use an item")
        .addStringOption(s => s.setName("itemid").setDescription("ID of the item to use").setRequired(true)),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {discord.Collection} currency
     */
    async execute(interaction, client, currency, users, currencyShop) {
        const itemID = interaction.options.getString("itemid")
        const user = interaction.user
        let userItems = await users.findOne({ where: { user_id: user.id } })
        userItems = await userItems?.getItems()
        // "numbers" array containing english spelled-out versions of all digits
        const numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
        const random = (arr) => { return arr[Math.floor(Math.random() * arr.length)] }
        // see if the user has the item they are searching for
        const item = userItems.find(i => i.item_id == itemID)
        if (item) {
            if (itemID === "legendarylootbox") {
                // TODO: make legendary lootbox generate random items and give the user the option to either sell them or keep them
                const embed = new discord.MessageEmbed({
                    title: "Legendary Lootbox",
                    description: "You have opened the legendary lootbox! Roll to generate your prizes!",
                    color: "#8B74BD"
                })
                const row = new discord.MessageActionRow()
                row.addComponents(new discord.MessageButton({
                    label: "Roll",
                    emoji: "🎲",
                    customId: "roll-lootbox",
                    style: "DANGER"
                }))
                await interaction.reply({
                    embeds: [embed],
                    components: [row]
                })

                const collector = interaction.channel.createMessageComponentCollector({ filter: i => i.user.id == user.id, componentType: "BUTTON", time: 30 * 1000 })
                collector.on("collect", async i => {
                    if (!i.isButton()) return
                    await i.deferUpdate();
                    if (i.customId === "roll-lootbox") {
                        const items = {}
                        // this for loop is adding the items to be shown but also showing the user a cool effect for generating too
                        for (let i = 0; i < 10; i++) {
                            const randomItem = random(Object.values(await currencyShop.findAll()))
                            if (randomItem.item_id in items) items[item_id].count++
                            else items[randomItem?.item_id] = { item: randomItem, count: 1 }
                            await interaction.editReply({
                                embeds: [new discord.MessageEmbed({
                                    title: "Legendary Lootbox",
                                    description: `:${random(numbers)}::${random(numbers)}::${random(numbers)}:`,
                                    color: "#8B74BD",
                                    footer: {
                                        text: `${user.tag}`
                                    }
                                })],
                                components: []
                            })
                            await new Promise(resolve => setTimeout(resolve, 250))
                        }
                        // after the for loop is done, we can show the user the items they got
                        const embed = new discord.MessageEmbed({
                            title: "Legendary Lootbox",
                            description: "You have opened the legendary lootbox! Here are the results:",
                            color: "#8B74BD",
                            footer: {
                                text: `rolled by ${user.tag}`,
                                iconURl: user.displayAvatarURL()
                            }
                        })
                        items.forEach(i => {
                            embed.addField(`x${i.count} ${i.item.emoji}${i.item.name}`, `${i.description}: ${currency.name}${i.item.price}`)
                        })
                        await interaction.editReply({
                            embeds: [embed]
                        })
                        console.log("Did we even get here?")
                    }
                })
            }
        } else {
            interaction.reply({
                embeds: [new discord.MessageEmbed({
                    title: "Use Item",
                    description: `Use item failed, because the item ${itemID} either does not exist, or you do not have one.`,
                    color: "DARK_RED"
                })], ephemeral: true
            })
        }
    }
}