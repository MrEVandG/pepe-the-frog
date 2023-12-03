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
        // an invisible, perfect square (used for alignment without using finicky font sizes)
        const invisible = "<:invisible:1053831594139459657>"
        function randomSleepMS(min,max) {
            return new Promise((r)=>setTimeout(r,Math.floor(Math.random()*(max-min+1)+min)))
        }
        function generateEmojiForRod(rodemoji, isfish) {
            // rodemoji: the json key/value pairs for the 4 emoji of each rod
            // isfish: a fish is currently on the line

            return `${rodemoji.rodwithoutbobber}${isfish?`${invisible.repeat(2)}:exclamation:`:""}\n${invisible}${rodemoji.linewithoutbobber}\n${invisible.repeat(2)}${rodemoji.linewithoutbobber}\n${":ocean:".repeat(3)}${rodemoji.linewithbobber}:ocean:`
        }
        const rods = Object.keys(await db.get(`users.${interaction.user.id}.items`)).filter(i=>i.includes("fishingrod"))
        let selectedRod = {}
        const homeEmbed = new discord.MessageEmbed({
            title: "Fishing",
            description: `:grey_question:\n\n${":ocean:".repeat(5)}`
        })
        if (rods.length == 0) {
            await interaction.reply({embeds:[{
                title: "You Don't Have Any Fishing Rods!",
                description: "You cannot go fishing because you didn't bring a rod with you. Oops!",
                color: "RED"
            }]})
        }
        let fishCaught = false
        let timeout = true
        let buttons = [new discord.MessageButton({
            customId: "pickRod",
            label: "Choose Rod",
            style: "SECONDARY"
        })]
        await interaction.reply({embeds:[homeEmbed],components:[new discord.MessageActionRow({components:buttons})]})
        const collector = interaction.channel.createMessageComponentCollector({message:await interaction.fetchReply()})
        collector.on("collect",async int=>{
            await int.update({fetchReply:false})
            timeout = false
            if (int.user.id != interaction.user.id) {
                int.followUp({ephemeral:true,embeds:[{color:"DARK_BUT_NOT_BLACK",description:"You cannot use this embed. It is not for you."}]})
            }
            if (int.customId=="pickRod") {
                let buttons2 = []
                for (const rod of rods) {
                    const rodItem =  utils.items.find(item=>item.item_id==rod)
                    buttons2.push(new discord.MessageButton({
                        customId: `pickRod-${rod}`,
                        label: rodItem.name,
                        emoji: rodItem.emoji.rodwithbobber,
                        style: "SUCCESS"
                    }))
                }
                await interaction.editReply({embeds:[{
                    title: "Pick Fishing Rod",
                    description: `Your currently selected rod is: ${selectedRod?.name||"None"}\nYou have ${rods.length} rod(s) to choose from.`,
                    color: "GREEN"
                }], components:[new discord.MessageActionRow({components:buttons2})]})
            } else if (int.customId.includes("pickRod")) {
                selectedRod = utils.items.find(item=>item.item_id==int.customId.split("-")[1])
                if (buttons.length<2) buttons.push(new discord.MessageButton({
                    customId: "goFish",
                    label: "Start",
                    style: "PRIMARY", // Blurple color
                }))
                homeEmbed.description = homeEmbed.description = homeEmbed.description.replace(":grey_question:",selectedRod.emoji.rodwithbobber)    
                await interaction.editReply({embeds:[homeEmbed],components:[new discord.MessageActionRow({components:buttons})]})
            } else if (int.customId=="goFish") {
                interaction.editReply({embeds:[{
                    title: "Fishing...",
                    description: generateEmojiForRod(selectedRod.emoji, false),
                    color: "BLUE"
                }],components:[]})
                // Randomly sleep for 5-15 seconds
                await randomSleepMS(5000,15000)
                await interaction.editReply({embeds:[{
                    title: "Fishing..!",
                    description: generateEmojiForRod(selectedRod.emoji, true),
                    color: "RED"
                }],components:[{type:"ACTION_ROW",components:[{
                    type: "BUTTON",
                    style: "DANGER",
                    label: "Reel In",
                    emoji: "🎣",
                    customId: "reel"
                }]}]})
                //? 3 second sleep (why am i using "random sleep" for a fixed amount? i dont know.)
                // 3 seconds - reaction time + API response time (hopefully discord isn't slow that day)
                await randomSleepMS(3000,3000)
                if (!fishCaught) {
                    await interaction.editReply({embeds:[{
                        color: "RED",
                        title: "Fish Missed",
                        description: `You missed that fish.\n${selectedRod.emoji.rodwithbobber}\n\n\n${":ocean:".repeat(5)}`,
                        timestamp: new Date()
                    }],components:[{type:"ACTION_ROW",components:[{
                        type: "BUTTON",
                        style: "SECONDARY", // gray
                        label: "Choose Rod",
                        customId: "pickRod",
                    }, {
                        type: "BUTTON",
                        style: "PRIMARY", // blurple
                        label: "Try Again",
                        customId: "goFish"
                    }]}]})
                    timeout = true
                    // 5s wait
                    await randomSleepMS(5000,5000)
                    if (timeout == true) {
                        interaction.editReply({components:[{type:"ACTION_ROW",components:[{
                            type: "BUTTON",
                            style: "SECONDARY", // gray
                            label: "Choose Rod",
                            customId: "pickRod",
                            disabled: true
                        }, {
                            type: "BUTTON",
                            style: "PRIMARY", // blurple
                            label: "Try Again",
                            customId: "goFish",
                            disabled: true
                        }]}]})
                    }
                    collector.stop("timeout")
                }
            } else if (int.customId=="reel") {
                if (fishCaught) {
                    interaction.editReply({embeds:[{
                        color: "RED",
                        title: "An Error Occured",
                        description: "My stupid idiot brain turned off so uhh have fun with this L",
                        timestamp: new Date()
                    }]})
                    // welp uhh javascript weirdness happens sometimes, what can i say
                    client.emit("warn","javascript being stupid???? fishing minigame variable 'currentFishReeledIn' already true")
                }
                fishCaught = true
                let caughtFish = utils.items.find(i=>i.item_id.endsWith("fish")&&i.rarity<=selectedRod.rarity&&i.rarity>=0)
                db.add(`users.${interaction.user.id}.items.${caughtFish.item_id}`,1)
                await interaction.editReply({embeds:[{
                    title: "Fish Successfully Caught",
                    description: `${selectedRod.emoji.rodwithbobber}${invisible.repeat(2)}${caughtFish.emoji}\n\n\n${":ocean:".repeat(5)}`,
                }],components:[{type:"ACTION_ROW",components:[{
                    type: "BUTTON",
                    style: "SECONDARY", // gray
                    label: "Choose Rod",
                    customId: "pickRod",
                }, {
                    type: "BUTTON",
                    style: "PRIMARY", // blurple
                    label: "Try Again",
                    customId: "goFish"
                }]}]})
                timeout = true
                // 5s wait
                await randomSleepMS(5000,5000)
                if (timeout == true) {
                    interaction.editReply({components:[{type:"ACTION_ROW",components:[{
                        type: "BUTTON",
                        style: "SECONDARY", // gray
                        label: "Choose Rod",
                        customId: "pickRod",
                        disabled: true
                    }, {
                        type: "BUTTON",
                        style: "PRIMARY", // blurple
                        label: "Try Again",
                        customId: "goFish",
                        disabled: true
                    }]}]})
                }
                collector.stop("timeout")
            }
        })
    }
}