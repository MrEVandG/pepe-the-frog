// hunt.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hunt")
        .setDescription("Enter... somewhere and hunt something"),
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     */
    async execute(interaction, client, db, utils) {
        let items = utils.items
        //! oh no im finally working on this command
        //! if someone is reading this github... send help 😪
        interaction.reply({
            embeds: [new discord.MessageEmbed({
                author: {
                    iconURL: interaction.user.displayAvatarURL(),
                    name: interaction.user.username + " is going on a hunt!"
                },
                title: "Choose an Area",
                color: "GREEN"
            })], components: [new discord.MessageActionRow({
                components: [new discord.MessageSelectMenu({
                    placeholder: "Pick an area to hunt in",
                    customId: "chosen-area",
                    options: [
                        {
                            label: "Forest",
                            value: "forest",
                            description: "Hunt in the trees",
                            emoji: "🌲"
                        },
                        {
                            label: "Desert",
                            value: "desert",
                            description: "Finding animals are harder, but hunting them is easier.",
                            emoji: "🌵"
                        }
                    ]
                })]
            })]
        }) // i had to retype these STUPID BRACES at least like 5 times it was so annoying send help
        //* listen for the select menu changing
        let messageId = (await interaction.fetchReply()).id
        interaction.channel.createMessageComponentCollector({ filter: int => int.message.id == messageId && int.user.id == interaction.user.id, time: 30 * 1000 }).on("collect", int => {
            if (int.customId == "chosen-area") {
                // change the picture and description when you change the dropdown
                let area = int.values[0] //? It's an array because some select menus can have multiple selected items
                if (area == "forest") {
                    interaction.editReply({
                        embeds: [new discord.MessageEmbed({
                            author: {
                                iconURL: interaction.user.displayAvatarURL(),
                                name: interaction.user.username + " is going on a hunt!"
                            },
                            title: "Hunt in the Forest",
                            description: "Animals here are common, but are harder to hunt and give mediocre loot. It's a good starting area if you're new to *the grind*.",
                            color: "DARK_GREEN"
                        })], components: [new discord.MessageActionRow({
                            components: [new discord.MessageSelectMenu({
                                placeholder: "Pick an area to hunt in",
                                customId: "chosen-area",
                                options: [
                                    {
                                        label: "Forest",
                                        value: "forest",
                                        description: "Hunt in the trees",
                                        emoji: "🌲"
                                    },
                                    {
                                        label: "Desert",
                                        value: "desert",
                                        description: "Finding animals are harder, but hunting them is easier.",
                                        emoji: "🌵"
                                    }
                                ]
                            })]
                        }), new discord.MessageActionRow({
                            components: [
                                new discord.MessageButton({
                                    customId: "select",
                                    label: "Select This Area",
                                    style: "PRIMARY", // Discord's signature blurple.
                                    emoji: "👇"
                                })
                            ]
                        })]
                    })
                } else if (area == "desert") {
                    interaction.editReply({
                        embeds: [new discord.MessageEmbed({
                            author: {
                                iconURL: interaction.user.displayAvatarURL(),
                                name: interaction.user.username + " is going on a hunt!"
                            },
                            title: "Hunt in the Desert",
                            description: "The desert is usually depicted as a barren wasteland of this Earth, and that's probably true. Animals here can be rare during the day, but they are very easy to hunt.",
                            color: "#d6c0a9" // Beige, sand-like color
                        })], components: [new discord.MessageActionRow({
                            components: [new discord.MessageSelectMenu({
                                placeholder: "Pick an area to hunt in",
                                customId: "chosen-area",
                                options: [
                                    {
                                        label: "Forest",
                                        value: "forest",
                                        description: "Hunt in the trees",
                                        emoji: "🌲"
                                    },
                                    {
                                        label: "Desert",
                                        value: "desert",
                                        description: "Finding animals are harder, but hunting them is easier.",
                                        emoji: "🌵"
                                    }
                                ]
                            })]
                        }), new discord.MessageActionRow({
                            components: [
                                new discord.MessageButton({
                                    customId: "select",
                                    label: "Select This Area",
                                    style: "PRIMARY", // Discord's signature blurple.
                                    emoji: "👇"
                                })
                            ]
                        })]
                    })
                }
                int.update({fetchReply: false}) //! Discord! Please make fetchReply disabled by default! I hate having to retype this constantly 🥺
            } else if (int.customId == "select") {
                //? Select this area and start hunting. I actually really don't want to code this.
            }
        })
        //* praise the lord for the bracket colorizer.
        //* why doesn't discord have an "append button" kind of feature rather than having to retype all that stuff again?
        //?! what if i have to add a new biome!??!
    }
}