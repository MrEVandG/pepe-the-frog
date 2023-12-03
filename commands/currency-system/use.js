// use.js
// discord.js template
const discord = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")
const items = require("../../utils/items.json")
module.exports = {
    data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item and consume on use.")
    .addStringOption(s=>s.setName("item").setDescription("The item to use").setRequired(true).setAutocomplete(true)),
    /**
     * 
     * @param {discord.AutocompleteInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
     */
    async autocomplete(interaction, client, db, utils) {
        // Luckily, there's only 1 box, so no if-statemnt needed
        const userItems = await db.get(`users.${interaction.user.id}.items`)
        const options = Object.keys(userItems).filter(key=>userItems[key]>0).sort()
        return await interaction.respond(options.map(option=>{return {value:option,name:utils.items.find(i=>i.item_id==option)?.name??option} }))
    },
    /**
     * @param {discord.CommandInteraction} interaction
     * @param {discord.Client} client
     * @param {quickdb.QuickDB} db
    */
   async execute(interaction, client, db, utils) {
        let useItem = interaction.options.getString("item")
        const currencyName = await db.get("name")
        const numberEmojis = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]
        // remove 1 useItem from the user's inventory (the item is consumed on use)
        /**
         * 
         * @param {Array<Any>} array 
         * @returns Random item anywhere in the array.
         */
        function random(array) { return array.at(Math.floor(Math.random()*array.length)) }

        async function removeItem(amount=1,item=useItem) {return await db.sub(`users.${interaction.user.id}.items.${item??useItem}`,amount??1)}
        let userInventoryAmount = await db.get(`users.${interaction.user.id}.items.${useItem}`)
        if (userInventoryAmount<1||userInventoryAmount==undefined) {
            return await interaction.reply({embeds:[new discord.MessageEmbed({
                title: "Item Not Owned",
                description: `You do not own the item \`${items.find(i=>i.item_id==useItem).name}\` or it does not exist, therefore it cannot be used.`,
                color: "RED"
            })]})
        }
        if (useItem == "resume") {
            await db.add(`users.${interaction.user.id}.job.shifts`,25)
            removeItem()
            return await interaction.reply({embeds:[new discord.MessageEmbed({
                title: "Good Resume",
                description: `You were rewarded 25 shifts for having a good resume. You now have ${await db.get(`users.${interaction.user.id}.job.shifts`)} shifts.`,
                color: "GREEN"
            })]})
        } else if (useItem=="legendarylootbox") {
            await interaction.reply({embeds:[new discord.MessageEmbed({
                color: "PURPLE",
                footer: {
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                },
                title: "Legendary Loot Box",
                description: "You have decided to open the legendary loot box. Press Roll to see what's inside!"
            })],components:[new discord.MessageActionRow({components:[new discord.MessageButton({
                customId: "roll_llb",
                emoji: "🎲",
                label: "Roll",
                style: "SECONDARY" // gray
            })]})]})
            const collector = interaction.channel.createMessageComponentCollector({filter:async i=>i.user.id==interaction.user.id&&i.message.id==(await interaction.fetchReply()).id,componentType:"BUTTON",max:1,time:15*1000})
            collector.on("collect",async int=>{
                if (int.customId=="roll_llb") {
                    for (let i=0;i<20;i++) {
                        interaction.editReply({embeds:[new discord.MessageEmbed({
                            footer: {
                                iconURL: interaction.user.displayAvatarURL(),
                                text: `${interaction.user.username} is rolling...`
                            },
                            color: "DARK_PURPLE",
                            title: "Legendary Loot Box is rolling...",
                            description: `${random(numberEmojis)}${random(numberEmojis)}${random(numberEmojis)}`
                        })],components:[]})
                        await new Promise(r=>setTimeout(r,350))
                    }
                    // Results
                    interaction.editReply({embeds:[new discord.MessageEmbed({
                        title: "Legendary Loot Box Results",
                        description: "I am not coding the random-item-adder yet.",
                        color: "DARK_GREEN",
                        footer: {
                            iconURL: interaction.user.displayAvatarURL(),
                            text: `${interaction.user.username} rolled`
                        }
                    })]})
                }
            })
            collector.on("end",(collected,reason)=>{
                if (reason==="time") {
                    interaction.editReply({components:[new discord.MessageActionRow({components:[new discord.MessageButton({
                        customId: "roll_llb",
                        emoji: "🎲",
                        label: "Roll",
                        style: "SECONDARY", // gray
                        disabled: true // grays out the entire button
                    })]})]})
                }
            })
        } else if (useItem == "scratchoff") {
            // removeItem() // Removes 1 `useItem`
            let components = [
                new discord.MessageActionRow({components:[
                    new discord.MessageButton({
                        customId:"scratchoff11",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff12",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff13",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff14",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff15",
                        style: "SECONDARY",
                        label: "Scratch",
                    })
                ]}),
                new discord.MessageActionRow({components:[
                    new discord.MessageButton({
                        customId:"scratchoff21",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff22",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff23",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff24",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff25",
                        style: "SECONDARY",
                        label: "Scratch",
                    })
                ]}),
                new discord.MessageActionRow({components:[
                    new discord.MessageButton({
                        customId:"scratchoff31",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff32",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff33",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff34",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff35",
                        style: "SECONDARY",
                        label: "Scratch",
                    })
                ]}),
                new discord.MessageActionRow({components:[
                    new discord.MessageButton({
                        customId:"scratchoff41",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff42",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff43",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff44",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff45",
                        style: "SECONDARY",
                        label: "Scratch",
                    })
                ]}),
                new discord.MessageActionRow({components:[
                    new discord.MessageButton({
                        customId:"scratchoff51",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff52",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff53",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff54",
                        style: "SECONDARY",
                        label: "Scratch",
                    }),
                    new discord.MessageButton({
                        customId: "scratchoff55",
                        style: "SECONDARY",
                        label: "Scratch",
                    })
                ]})
            ]
            let dollarAmounts = [100,250,325,500,550]
            let collectedScratchAmounts = []
            await interaction.reply({embeds:[new discord.MessageEmbed({
                title: "Scratch Off Ticket",
                color: "YELLOW",
                description: "Try it. 3-of-a-kind is a win. You might win something. (0/5 scratches)"
            })],components})
            let reply = await interaction.fetchReply()
            interaction.channel.createMessageComponentCollector({message:reply,max:5}).on("collect",async int=>{
                if (int.user.id!==interaction.user.id) return int.reply({ephemeral:true,content:"these buttons are not for u"});
                let amount = random(dollarAmounts)
                components.forEach(row=>{
                    row.components.forEach(button=>{
                        if (button.customId==int.customId) {
                            button.setDisabled(true)
                            button.setLabel(`${currencyName}${amount}`)
                            button.setStyle("SUCCESS")
                        }
                    })
                })
                collectedScratchAmounts.push(amount)
                await int.update({fetchReply:false})
                await interaction.editReply({embeds:[new discord.MessageEmbed({
                    title: "Scratch Off Ticket",
                    color: "YELLOW",
                    description: `Try it. You might earn something. (${collectedScratchAmounts.length}/5 scratches)`
                })], components})
            }).on("end",async(collected,reason)=>{
                if (reason=="limit") {
                    await new Promise(r=>setTimeout(r,750)) // Give server enough time to change button label
                    let occurences = {}
                    components.forEach(row=>{
                        row.components.forEach(button=>{
                            button.setDisabled(true)
                            if (!button.label.includes(currencyName)) button.setLabel(`${currencyName}${random(dollarAmounts)}`)
                        })
                    })
                    collectedScratchAmounts.forEach(amount=>{
                        occurences[amount] = (occurences[amount] || 0) + 1
                    })
                    // sort occurences from greatest to least
                    let sortedOccurences = Object.entries(occurences).sort((a,b)=>b[1]-a[1])
                    if (sortedOccurences[0][1]<3) {
                        interaction.editReply({embeds:[new discord.MessageEmbed({
                            title: "Scratch Off Ticket",
                            description: `Sorry, you didn't win anything.`,
                            color:"RED"
                        })],components})
                    } else {
                        await interaction.editReply({embeds:[new discord.MessageEmbed({
                            title: "Scratch Off Ticket",
                            description: `You won ${currencyName}${sortedOccurences[0][0]}! It has automatically been added to your account.`,
                            color:"GREEN"
                        })],components})
                        await db.add(`users.${interaction.user.id}.currency`,sortedOccurences[0][0])
                    }
                }
            })
        } else {
            return await interaction.reply({embeds:[{
                color: "RED",
                title: "Item Can't Be Used",
                description: "The item you are trying to use does not have a /use functionality. Make sure the item has functionality and doesn't have its own command.\nEx: Fishing Rods are used with /fish"
            }]})
        }
    }
}