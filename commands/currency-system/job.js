// job.js
// discord.js template
const discord = require("discord.js")
const { MessageActionRow, MessageButton, MessageEmbed } = discord
const { SlashCommandBuilder } = require("@discordjs/builders")
const quickdb = require("quick.db")
const jobsList = require("../../utils/jobs.json")
let orderedJobList = structuredClone(jobsList).sort((a, b) => a.shiftstounlock - b.shiftstounlock)
orderedJobList.splice(orderedJobList.findIndex(job => job.value == "unemployed"), 1)
let string
let example = {
    data: new SlashCommandBuilder()
    .setName("job")
    .setDescription("Work shifts and get paid!")
    .addSubcommand(sc => sc.setName("work-shift")
    .setDescription("Work your shift, and get paid."))
    .addSubcommand(sc => sc.setName("list")
    .setDescription("View a list of all jobs that can be worked."))
        .addSubcommand(sc => sc.setName("resign")
            .setDescription("Leave your job and become unemployed."))
            .addSubcommand(sc => sc.setName("status")
            .setDescription("View someone's (un)employment status.")
            .addUserOption(u => u.setName("user").setDescription("The user to view. You by default.").setRequired(false)))
            .addSubcommand(sc => sc.setName("apply").setDescription("Apply for a job!").addStringOption(s => {
                string = s.setName("job").setDescription("The job to apply for").setRequired(true)
                return s
            })),
            /**
             * @param {discord.CommandInteraction} interaction
             * @param {discord.Client} client
             * @param {quickdb.QuickDB} db
             * @param {Array<Object>} utils
            */
        async execute(interaction, client, db, utils) {
            let userJob = await db.get(`users.${interaction.user.id}.job`)
            if (userJob.job.startsWith("ueoos-")) {
                let userShifts = userJob.job.split("-")[2]
                let dateOfTermination = userJob.job.split("-")[3]
                let userOldJob = jobsList.find(job=>job.value==userJob.job.split("-")[1])
                await interaction.user.send({embeds:[{
                    title: "You were fired for not working",
                    description: `You were fired from your job, ${userOldJob.name}, because you did not work enough shifts on <t:${dateOfTermination/1000}:D> (${userShifts}/${userOldJob.shiftsperday} shifts).`
                }]})
                await db.set(`users.${interaction.user.id}.job.job`,"unemployed")
                userJob.job = "unemployed"
            }
            let shifts = userJob.shifts
            let currencyName = await db.get("name")
            let job = jobsList.find(j => j.value == userJob.job)
            if (!job) {
                // This user does not have a job in the joblist. Better let the devs know about that....
                client.emit("warn",`User ${interaction.user.username} (ID \`${interaction.user.id}\`) has an out-of-bounds job ID \`${userJob.job}\`. Better look into that.`)
            }
            if (interaction.options.getSubcommand() == "list") {
                    let group = 0
                    const row = new discord.MessageActionRow({
                        components: [
                            new discord.MessageButton({
                                customId: "back",
                                style: "PRIMARY",
                                disabled: false,
                                emoji: "<:arrowleft:974490265689665576>"
                            }),
                            new discord.MessageButton({
                                customId: "next",
                                style: "PRIMARY",
                                disabled: false,
                                emoji: "<:arrowright:974490265681264690>"
                            })
                        ]
                    })
                    const embed = new discord.MessageEmbed({
                        title: "Job List",
                        description: "After you found your one, you can run </job apply:1054798487239266361> and the job name to apply!",
                        color: "GREEN",
                        fields: orderedJobList.slice(group * 10, ((group + 1) * 10) - 1).map(job => { return { name: (shifts >= job.shiftstounlock ? "✅" : "❎").concat(job?.name??"unknown job"), value: `${currencyName}${(job?.wage)||1}/shift ${job.shiftsperday} shifts/day ${job.shiftstounlock} shifts to unlock` } })
                    })
                    row.components[0].disabled = group == 0
                    row.components[1].disabled = group == Math.floor(jobsList.length / 10) // if this group is the last possible group
                    await interaction.reply({ embeds: [embed], components: [row] })
                    let reply = await interaction.fetchReply()
                    if (group != 0 && jobsList.length > 10) {
                        interaction.channel.createMessageComponentCollector({ filter: m=>m.message.id==reply.id, componentType: "BUTTON", time: 180 * 1000 }).on("collect", async (int) => {
                            if (int.user.id != interaction.user.id) {
                                return await int.reply({ embeds: [new MessageEmbed({ description: "These buttons are not for u", color: "#36393F" })], ephemeral: true })
                            }
                            if (int.customId == "back") {
                                group -= 1
                            }
                            if (int.customId == "next") {
                                group += 1
                            }
                            const embed = new discord.MessageEmbed({
                                title: "Job List",
                                description: "After you found your one, you can run </job apply:1054798487239266361> and the job name to apply!",
                                color: "GREEN",
                                fields: orderedJobList.slice(group * 10, ((group + 1) * 10) - 1).map(job => { return { name: (shifts >= job.shiftstounlock ? "✅" : "❎").concat(job?.name??"unknown job"), value: `${currencyName}${(job?.wage)||1}/shift ${job.shiftsperday} shifts/day ${job.shiftstounlock} shifts to unlock` } })
                            })
                            row.components[0].disabled = group == 0
                            row.components[1].disabled = group == Math.floor(jobsList.length / 10)
                            await interaction.editReply({ components: [row], embeds: [embed] })
                        })
                    }
            }
            if (interaction.options.getSubcommand() == "apply") {
                    let job = jobsList.find(j => j.value == interaction.options.getString("job"))
                    if (job.shiftstounlock > shifts) return await interaction.reply({
                        embeds: [new discord.MessageEmbed({
                            title: "Work More Shifts",
                            color: "RED",
                            description: `Your application was denied because you need to work more shifts(${await db.get(`users.${interaction.user.id}.job.shifts`)}/${job.shiftstounlock}).`
                        })]
                    })
                    if (userJob.job != "unemployed") {
                        return await interaction.reply({
                            embeds: [new discord.MessageEmbed({
                                title: "Resign first",
                                color: "RED",
                                description: `Your application was declined because you are currently employed. You must be unemployed to apply for a job. Run </job resign:1051666684978659348> to resign.`
                            })]
                        })
                    }
                    let applyTime = require("./../../utils/botSettings.json").job.applyTimeSeconds
                    await interaction.reply({
                        embeds: [new discord.MessageEmbed({
                            title: "Application Submitted",
                            description: `Your job application has been submitted. Wait ${applyTime} seconds for review. We will DM you when it's done.`,
                            color: "GREEN"
                        })]
                    })
                    await new Promise(r => setTimeout(r, applyTime * 1000))
                    await db.set(`users.${interaction.user.id}.job.job`, job.value)
                    await db.add(`users.${interaction.user.id}.job.shiftstoday`, 100)
                    let midnight = new Date()
                    midnight.setUTCHours(0, 0, 0, 0)
                    midnight.setUTCDate(midnight.getUTCDate() + 1)
                    await interaction.user.send({
                        embeds: [new discord.MessageEmbed({
                            title: "Application Accepted",
                            description: `Lucky you! Your application to \`${job?.name??"unknown job"}\` was accepted and you are now employed. Run </job work-shift:1054798487239266361> ${job.shiftsperday} time${job.shiftsperday > 1 ? "s" : ""} a day to keep it!\n(Since it's your first day, you don't have to do any shifts today! But you do have to fulfill them tomorrow!). Shifts are due by <t:${midnight.getTime() / 1000}:t> your time (12AM UTC).`,
                            color: "GREEN"
                        })]
                    })
            }
            if (interaction.options.getSubcommand() === "status") {
                let target = interaction.options.getUser("user") ?? interaction.user
                await db.failSafe(target.id)
                let targetJob = await db.get(`users.${target.id}.job`)
                let targetJobStatus = targetJob.job
                let status = jobsList.find(job => job.value == targetJobStatus)?.name
                if(!status) {
                    if(target.id!=interaction.user.id) client.emit("warn",`User ${target.username} (ID \`${target.id}\`) has an out-of-bounds job ID \`${targetJob.job}\`. Better look into that.`);
                    return await interaction.reply({embeds:[{
                        title: "Uhhh... That's weird.",
                        description: "The user you are trying to view works at a job that... doesn't exist. The developers have already been warned, but you should probably keep your distance.",
                    }]})
                }
                let targetShifts = targetJob.shifts ?? 0
                if (targetJobStatus == "unemployed" || targetJobStatus == undefined) {
                    return await interaction.reply({
                        embeds: [new discord.MessageEmbed({
                            title: target.username + " is unemployed.",
                            description: `${target.username} has no job or is not registered. They are earning ${currencyName}0 per shift, with ${targetShifts} shift(s) on record.`,
                            color: "RED"
                        })]
                    })
                }
                return await interaction.reply({
                    embeds: [new discord.MessageEmbed({
                        title: `${target.username} is a ${status}`,
                        description: `${target.username} is a ${status} earning ${currencyName}${jobsList.find(j => j.name == status).wage} per shift with ${targetJob.shifts} shifts on record. To check their balance, run </balance:1054798487239266358> and their name.`,
                        color: "GREEN"
                    })]
                })
            }
            if (interaction.options.getSubcommand() === "resign") {
                await db.set(`users.${interaction.user.id}.job.job`, "unemployed")
                if (userJob.job == "unemployed") {
                    return await interaction.reply({
                        embeds: [new discord.MessageEmbed({
                            title: "Already Unemployed",
                            description: "You couldn't resign your job because you don't have one. Run </job apply:1051666684978659348> to apply for one.",
                            color: "RED"
                        })]
                    })
                }
                await interaction.reply({
                    embeds: [new discord.MessageEmbed({
                        title: "You Left Your Job As A " + job?.name??"`Unknown Job`",
                        color: "ORANGE",
                        description: `You resigned your job as a ${job?.name??"`Unknown Job`"} and are now currently unemployed. Run </job apply:1054798487239266361> to apply for a new one.`
                    })]
                })
            }
            if (interaction.options.getSubcommand() === "work-shift") {
                // choose a random minigame
                // god damn, there's so much code kill me now
                if (userJob.job == "unemployed" || userJob.job == undefined) {
                    return await interaction.reply({
                        embeds: [new MessageEmbed({
                            title: "Not Employed",
                            description: "You can't work because you're unemployed. To get a list of available jobs, run </job joblist:1054798487239266361>. To apply for a job, run </job apply:1054798487239266361>.",
                            color: "RED"
                        })]
                    })
                }
                let randomInt = Math.floor(Math.random() * 5) // 3 different possibilities (including personalized)
                // let randomInt = 2 // just for now while i test cuztomized minigames.
                if (randomInt == 0) {
                    let descriptionLeft = ":wastebasket::wastebasket::wastebasket:\n\n\n:basketball:"
                    let descriptionMid = ":wastebasket::wastebasket::wastebasket:\n\n\n<:invisible:1053831594139459657>:basketball:"
                    let descriptionRight = ":wastebasket::wastebasket::wastebasket:\n\n\n<:invisible:1053831594139459657><:invisible:1053831594139459657>:basketball:"
                    let listening = true
                    let failed = true
                    let row = new MessageActionRow({
                        components: [
                            new MessageButton({
                                customId: "0left",
                                label: "Left",
                                style: "SECONDARY",
                            }),
                            new MessageButton({
                                customId: "1center",
                                label: "Center",
                                style: "SECONDARY",
                            }),
                            new MessageButton({
                                customId: "2right",
                                label: "Right",
                                style: "SECONDARY",
                            })
                        ]
                    })
                    let msBetweenUpdates = 1500
                    await interaction.reply({
                        embeds: [new MessageEmbed({
                            title: "Shoot the Ball",
                            color: "ORANGE",
                            description: descriptionLeft
                        })], components: [row]
                    })
                    let reply = await interaction.fetchReply()
                    for (let i = 0; i <= (30000 / msBetweenUpdates); i++) { // always lasts 30 seconds
                        interaction.channel.createMessageComponentCollector({ filter: m=>m.message.id==reply.id&&listening, componentType: "BUTTON", time: msBetweenUpdates }).on("collect", async int => {
                            if (int.user.id != interaction.user.id) {
                                return await interaction.followUp({ embeds: [new MessageEmbed({ description: "These buttons are not for u", color: "#36393F" })], ephemeral: true })
                            }
                            if (!int.replied) int.update({fetchReply:false});
                            listening = false
                            failed = !(parseInt(int.customId.charAt(0)) == i % 3)
                        })
                        if (!listening) break
                        await interaction.editReply({
                            embeds: [new MessageEmbed({
                                title: "Shoot the Ball",
                                color: "ORANGE",
                                description: i % 3 == 0 ? descriptionLeft : (i % 3 == 1 ? descriptionMid : descriptionRight)
                            })], components: [row]
                        })
                        await new Promise(r => setTimeout(r, msBetweenUpdates))
                        // now we repeat it again.
                    }
                    if (failed) {
                        await interaction.editReply({
                            embeds: [new MessageEmbed({
                                title: "You Failed",
                                color: "RED",
                                description: "You failed to shoot the basketball and didn't make any money."
                            })], components: []
                        })
                    } else {
                        await db.add(`users.${interaction.user.id}.currency`, job?.wage||1)
                        await db.add(`users.${interaction.user.id}.job.shifts`, 1)
                        await interaction.editReply({
                            embeds: [new MessageEmbed({
                                title: `You Made ${currencyName}${(job?.wage)||1} for working as a ${job?.name??"unknown job"}`,
                                description: "Nice shot, " + interaction.user.tag,
                                color: "GREEN"
                            })], components: []
                        })
                    }

                } else if (randomInt == 1) {
                    let emojis = ["😀", "🙃", "😇", "🤪", "🥺", "🤣", "🥶", "🤯", "🥴", "🤠"]
                    let randomEmoji = emojis.at(Math.floor(Math.random() * emojis.length))
                    await interaction.reply({
                        embeds: [new MessageEmbed({
                            title: "Remember This Emoji",
                            description: randomEmoji,
                            color: "#36393F"
                        })],
                        components: []
                    })
                    await new Promise(r => setTimeout(r, 3000))
                    let components = emojis.map(e => new MessageButton({
                        label: e,
                        style: "SECONDARY",
                        customId: "e" + emojis.findIndex(i => i == e),
                        type: "BUTTON"
                    }))
                    let failed
                    if (failed == undefined) await interaction.editReply({ embeds: [new MessageEmbed({ title: "What was the Emoji?" })], components: [new MessageActionRow({ components: components.slice(0, 5) }), new MessageActionRow({ components: components.slice(5, 10) })] })
                    let reply = await interaction.fetchReply()
                    let collector = interaction.channel.createMessageComponentCollector({ filter: m=>m.message.id==reply.id, time: 20000, componentType: "BUTTON" }).on("collect", async int2 => {
                        if (int2.user.id != interaction.user.id) return await int2.reply({ embeds: [new MessageEmbed({ description: "These buttons are not for u", color: "#36393F" })], ephemeral: true })
                        if (emojis.at(int2.customId.charAt(1)) === randomEmoji) {
                            failed = false
                        } else {
                            failed = true
                        }
                        collector.stop("max")
                    }).on("end", async (collected, reason) => {
                        if (failed == undefined) failed = true
                        if (failed) {
                            return await interaction.editReply({
                                embeds: [new MessageEmbed({
                                    title: "You Failed",
                                    description: reason == "time" ? "You did not choose in time and did not earn any money." : "You chose the wrong option and didn't earn any money.",
                                    color: "RED"
                                })], components: []
                            })
                        } else {
                            await db.add(`users.${interaction.user.id}.job.shifts`, 1)
                            await db.add(`users.${interaction.user.id}.job.shiftstoday`, 1)
                            await db.add(`users.${interaction.user.id}.currency`, (job?.wage)||1)
                            return await interaction.editReply({
                                embeds: [new MessageEmbed({
                                    title: `You Made ${currencyName}${(job?.wage)||1} for working as a ${job?.name??"unknown job"}`,
                                    description: "Great memory, " + interaction.user.tag,
                                    color: "GREEN"
                                })], components: []
                            })
                        }
                    })
                } else if (randomInt > 1 && randomInt < 6) { // personalized minigame
                    if (userJob.job == "babysitter") {
                        // this list represents how high each child is from the bottom of the screen.
                        // If they reach the top of the screen(3), they die and you fail.
                        let childrenDistances = [0, 0, 0]
                        // oh god
                        function generateKidDistances(distances) {
                            return `${(distances[0] == 4 ? "⚡" : "🔌")}${(distances[1] == 4 ? "⚡" : "🔌")}${(distances[2] == 4 ? "⚡" : "🔌")}\n${distances[0] == 3 ? "🧒" : (distances[0] == 4 ? ":skull:" : "<:invisible:1053831594139459657>")}${distances[1] == 3 ? "🧒" : (distances[1] == 4 ? ":skull:" : "<:invisible:1053831594139459657>")}${distances[2] == 3 ? "🧒" : (distances[2] == 4 ? ":skull:" : "<:invisible:1053831594139459657>")}\n${distances[0] == 2 ? "🧒" : "<:invisible:1053831594139459657>"}${distances[1] == 2 ? "🧒" : "<:invisible:1053831594139459657>"}${distances[2] == 2 ? "🧒" : "<:invisible:1053831594139459657>"}\n${distances[0] == 1 ? "🧒" : "<:invisible:1053831594139459657>"}${distances[1] == 1 ? "🧒" : "<:invisible:1053831594139459657>"}${distances[2] == 1 ? "🧒" : "<:invisible:1053831594139459657>"}\n${distances[0] == 0 ? "🧒" : "<:invisible:1053831594139459657>"}${distances[1] == 0 ? "🧒" : "<:invisible:1053831594139459657>"}${distances[2] == 0 ? "🧒" : "<:invisible:1053831594139459657>"}`
                        }
                        let embed = new MessageEmbed({ title: "Save the Kids", description: "🔌🔌🔌\n\n\n🧒🧒🧒" })
                        const row = new MessageActionRow({
                            components: [
                                new MessageButton({
                                    customId: "leftchild",
                                    style: "SECONDARY",
                                    label: "Left"
                                }),
                                new MessageButton({
                                    customId: "middlechild",
                                    style: "SECONDARY",
                                    label: "Middle"
                                }),
                                new MessageButton({
                                    customId: "rightchild",
                                    style: "SECONDARY",
                                    label: "Right"
                                })
                            ]
                        })
                        let gameDurationSeconds = 10
                        let secondsLeft = gameDurationSeconds
                        await interaction.reply({ embeds: [embed], components: [new MessageActionRow({ components: [new MessageButton({ customId: "startchildminigame", style: "SUCCESS", label: "Start" })] })] })
                        let reply = await interaction.fetchReply()
                        let collector = interaction.channel.createMessageComponentCollector({ filter: m=>m.message.id==reply.id, componentType: "BUTTON" }).on("collect", async int => {
                            if (int.user.id != interaction.user.id) return await int.reply({ embeds: [new MessageEmbed({ description: "These buttons are not for u", color: "#36393F" })], ephemeral: true })
                            await int.update({ fetchReply: false })
                            if (int.customId == "startchildminigame") {
                                await interaction.editReply({ embeds: [embed], components: [row] })
                                for (let i = 0; i < gameDurationSeconds; i++) {
                                    if (Math.floor(Math.random() * 5) != 0) {
                                        childrenDistances[Math.floor(Math.random() * 3)]++ // random element in childrenDistances gets pushed one square further
                                        childrenDistances.forEach((id, ix) => { if (id > 4) { childrenDistances[ix] = 4 } }) // if a kid is further than level 4, cap it to level 4
                                    }
                                    await interaction.editReply({ embeds: [new MessageEmbed({ title: `Save the Kids (${secondsLeft}s left)`, description: generateKidDistances(childrenDistances) })], components: [row] })
                                    await new Promise(r => setTimeout(r, 1000))
                                    secondsLeft--
                                }
                                if (childrenDistances.find(i => i == 4)) {
                                    // one of the kids reached the end and died! They failed the minigame!
                                    await interaction.editReply({ embeds: [new MessageEmbed({ title: "You Failed", description: "One or more of the children reached the power outlet and died.\n" + generateKidDistances(childrenDistances) })], components: [] })
                                    collector.stop("kiddead")
                                } else {
                                                                        await db.add(`users.${interaction.user.id}.job.shifts`, 1)
                                    await db.add(`users.${interaction.user.id}.job.shiftstoday`, 1)
                                    await db.add(`users.${interaction.user.id}.currency`, (job?.wage)||1)
                                    collector.stop("moneymade")
                                    return await interaction.editReply({
                                        embeds: [new MessageEmbed({
                                            title: `You Made ${currencyName}${(job?.wage)||1} for working as a ${job?.name??"unknown job"}`,
                                            description: `Great work, ${interaction.user.tag}\n${generateKidDistances(childrenDistances)}`,
                                            color: "GREEN"
                                        })], components: []
                                    })
                                }
                            }
                            if (secondsLeft > 0) {
                                if (int.customId == "leftchild") {
                                    if (childrenDistances[0] >= 4) return;
                                    childrenDistances[0] = 0
                                    await interaction.editReply({ embeds: [new MessageEmbed({ title: `Save the Kids (${secondsLeft}s left)`, description: generateKidDistances(childrenDistances) })], components: [row] })
                                }
                                if (int.customId == "middlechild") {
                                    if (childrenDistances[1] >= 4) return;
                                    childrenDistances[1] = 0
                                    await interaction.editReply({ embeds: [new MessageEmbed({ title: `Save the Kids (${secondsLeft}s left)`, description: generateKidDistances(childrenDistances) })], components: [row] })
                                }
                                if (int.customId == "rightchild") {
                                    if (childrenDistances[2] >= 4) return;
                                    childrenDistances[2] = 0
                                    await interaction.editReply({ embeds: [new MessageEmbed({ title: `Save the Kids (${secondsLeft}s left)`, description: generateKidDistances(childrenDistances) })], components: [row] })
                                }
                            }
                        })
                    }
                    else if (userJob.job == "cashier" || (userJob.job == "chef" && Math.random() > 0.5)) { //? there is a random chance that the chef gets the cookie minigame OR the ingredient minigame
                        let words = [{ emoji: "🥩", text: "Meat" }, { emoji: "🥚", text: "Egg" }, { emoji: "🥬", text: "Lettuce" }, { emoji: "🍅", text: "Tomato" }, { emoji: "🍞", text: "Bread" }, { emoji: "🧂", text: "Salt" }, { emoji: "🧅", text: "Onion" }]
                        words = words.sort(() => Math.random() > 0.5 ? 1 : -1).slice(0, 5) // Sort the words and emojis randomly.
                        let wordsForButtons = structuredClone(words)
                        let words3 = structuredClone(words)
                        await interaction.reply({
                            embeds: [new MessageEmbed({
                                title: "Remember the Order",
                                description: `\`${words.map(item => item.emoji + " " + item.text).join("\n")}\``
                            })]
                        })
                        let reply = await interaction.fetchReply()
                        await new Promise(r => setTimeout(r, 3000))
                        // omg kill me now why do i keep writing such long lines of code
                        const row = new MessageActionRow({ components: wordsForButtons.sort(() => Math.random() > 0.5 ? 1 : -1).map(item => new MessageButton({ customId: item.text.toLowerCase(), style: "SECONDARY", emoji: item.emoji, label: item.text })) })
                        const embed = new MessageEmbed({ title: "Reenter the words in order." })
                        await interaction.editReply({ embeds: [embed], components: [row] })
                        let collector = interaction.channel.createMessageComponentCollector({ filter: m=>m.message.id==reply.id, componentType: "BUTTON" }).on("collect", async int => {
                            if (int.user.id != interaction.user.id) return await int.reply({ embeds: [new MessageEmbed({ description: "These buttons are not for u", color: "#36393F" })], ephemeral: true })
                            int.update({ fetchReply: false })
                            if (int.component.label == words3[0].text) { // since im an idiot who doesn't know how to compare
                                // shift actually deletes it for me so i don't have to do that.
                                // now to disable the button and listen for more presses!
                                words3.shift()
                                row.components.find(i => i.customId == int.customId).setDisabled(true)
                                await new Promise(r => setTimeout(r, 50))
                                await interaction.editReply({ components: [row], embed: [embed] })
                                if (words3.length == 0) {
                                    // we're out of buttons! they won!
                                    await db.add(`users.${interaction.user.id}.job.shifts`, 1)
                                    await db.add(`users.${interaction.user.id}.job.shiftstoday`, 1)
                                    await db.add(`users.${interaction.user.id}.currency`, (job?.wage)||1)
                                    collector.stop("moneymade")
                                    return await interaction.editReply({
                                        embeds: [new MessageEmbed({
                                            title: `You Made ${currencyName}${(job?.wage)||1} for working as a Cashier`,
                                            description: `Great work, ${interaction.user.tag}`,
                                            color: "GREEN"
                                        })], components: []
                                    })
                                }
                            } else {
                                // Uh-oh! The user got it wrong! We have to fail the minigame.
                                collector.stop("failed")
                            }
                        }).on("end",(collected,reason)=>{
                            if (reason=="failed") {
                                return interaction.editReply({ components: [], embeds: [new MessageEmbed({ title: "You failed!", description: `That was not the order of the words. The correct order was ${words[0].text}, ${words.slice(1, 6).map(i => i.text.toLowerCase()).join(", ")}.`, color: "RED" })] })
                            }
                        })
                    }
                    else if (userJob.job == "chef" || userJob.job == "baker") {
                        let reactionSpeed = 2000
                        let stop = false
                        await interaction.reply({
                            embeds: [new MessageEmbed({
                                title: "Bake the Cookie",
                                color: "#874e12",
                                description: "<:invisible:1053831594139459657>\n<:invisible:1053831594139459657>\n🍪<:invisible:1053831594139459657><:invisible:1053831594139459657><:invisible:1053831594139459657><:openoven:1054265894135668776>"
                            })], components: [new MessageActionRow({
                                components: [new MessageButton({
                                    label: "Bake the Cookie",
                                    style: "SUCCESS",
                                    customId: "startbakingminigame"
                                })]
                            })]
                        })
                        let reply = await interaction.fetchReply()
                        interaction.channel.createMessageComponentCollector({ filter: m=>m.message.id==reply.id, time: 180000, max: 1 }).on("collect", async int => {
                            if (int.user.id != interaction.user.id) {
                                return await interaction.followUp({ embeds: [new MessageEmbed({ description: "These buttons are not for u", color: "#36393F" })], ephemeral: true })
                            }
                            if (int.customId == "startbakingminigame") {
                                int.update({fetchReply:false})
                                let takeCookiesOutRow = new MessageActionRow({
                                    components: [new MessageButton({
                                        label: "Take cookies Out",
                                        style: "DANGER",
                                        customId: "takeoutcookies"
                                    })]
                                })
                                await interaction.editReply({
                                    embeds: [new MessageEmbed({
                                        title: "Baking the Cookie",
                                        color: "#874e12",
                                        description: "<:invisible:1053831594139459657>\n<:invisible:1053831594139459657>\n<:invisible:1053831594139459657><:invisible:1053831594139459657><:invisible:1053831594139459657><:invisible:1053831594139459657><:ovenbakingcookies:1054265925207064617>"
                                    })], components: [takeCookiesOutRow]
                                })
                                const cookieBakingTimeMS = 5000 // 5 seconds of baking time
                                let cookiesDoneBaking = false
                                let reactionTimeOver = false
                                interaction.channel.createMessageComponentCollector({ filter: m=> m.message.id==reply.id, time: cookieBakingTimeMS + reactionSpeed }).on("collect", async int2 => {
                                    if (int2.user.id != interaction.user.id) {
                                        return await interaction.followUp({ embeds: [new MessageEmbed({ description: "These buttons are not for u", color: "#36393F" })], ephemeral: true })
                                    }
                                    if (stop) return;
                                    if (cookiesDoneBaking && !reactionTimeOver) {
                                        stop = true
                                        await db.add(`users.${interaction.user.id}.job.shifts`, 1) // do this later when its under the jobs command 
                                        await db.add(`users.${interaction.user.id}.currency`, (job?.wage)||1) // do this later when its under the jobs command 
                                        return await interaction.editReply({
                                            embeds: [new MessageEmbed({
                                                title: `You Made ${currencyName}${(job?.wage)||1} for working as a ${job?.name??"unknown job"}`,
                                                description: "Nice reaction speeds, " + interaction.user.tag,
                                                color: "GREEN"
                                            })], components: []
                                        })
                                    }
                                    if (stop) return;
                                    if (cookiesDoneBaking && reactionTimeOver) {
                                        stop = true
                                        return await interaction.editReply({
                                            embeds: [new MessageEmbed({
                                                title: "You Failed",
                                                description: "You did not take the cookie out in time and burned them. Yuck, burnt cookies!",
                                                color: "RED"
                                            })], components: []
                                        })
                                    }
                                    if (!cookiesDoneBaking && !reactionTimeOver) {
                                        stop = true
                                        return await interaction.editReply({
                                            embeds: [new MessageEmbed({
                                                title: "You Failed",
                                                color: "DARK_RED",
                                                description: "You took the cookies out too early and underbaked them. Too bad!"
                                            })], components: []
                                        })
                                    }
                                }).on("end", async (c, reason) => {
                                    if (stop) return;
                                    if (reason == "time") {
                                        stop = true
                                        return await interaction.editReply({
                                            embeds: [new MessageEmbed({
                                                title: "You Failed",
                                                description: "You did not take the cookie out in time and burned them. Yuck, burnt cookies!",
                                                color: "RED"
                                            })], components: []
                                        })
                                    }
                                })
                                await new Promise(r => setTimeout(r, cookieBakingTimeMS))
                                cookiesDoneBaking = true
                                reactionTimeOver = false
                                if (stop) return;
                                await interaction.editReply({
                                    embeds: [new MessageEmbed({
                                        title: "Take Out The Cookie!",
                                        color: "RED",
                                        description: "<:invisible:1053831594139459657>\n<:invisible:1053831594139459657><:invisible:1053831594139459657><:invisible:1053831594139459657><:invisible:1053831594139459657>:hotsprings:\n<:invisible:1053831594139459657><:invisible:1053831594139459657><:invisible:1053831594139459657><:invisible:1053831594139459657><:ovenbakingcookies:1054265925207064617>"
                                    })], components: [takeCookiesOutRow]
                                })
                                await new Promise(r => setTimeout(r, reactionSpeed))
                                reactionTimeOver = true
                                stop = true
                            }
                        }).on("end", async (c, reason) => {
                            if (reason == "time") {
                                return await interaction.editReply({
                                    embeds: [new MessageEmbed({
                                        title: "Bruh",
                                        description: "I gave you 3 minutes to start the minigame and you don't even do anything. I don't even know what to say.🤦‍♂️",
                                        color: "#36393F"
                                    })], components: []
                                })
                            }
                        })
                    }
                    else if (userJob.job == "builder") {
                        interaction.reply({
                            embeds: [{
                                description: "<:invisible:1053831594139459657>🧱<:invisible:1053831594139459657>\n\n\n🧱<:invisible:1053831594139459657>🧱\n🧱🧱🧱"
                            }], components: [{ type: "ACTION_ROW", components: [{ type: "BUTTON", emoji: "🏗", label: "Build", style: "PRIMARY", customId: "startbuildingminigame" }] }]
                        })
                    }
                    else if (userJob.job == "programmer") {
                        //? Time to code my life into a 30-second minigame. Oh boy.
                        interaction.reply("as a fellow programmer, i dont want to put this into a minigame. please tell me how to do so.")
                    }
                } else { // out of range error
                    await interaction.reply({
                        embeds: [new discord.MessageEmbed({
                            title: "Error!!",
                            description: "Developer has been contacted about the issue. ",
                            footer: {
                                iconURL: "https://i.imgur.com/gOpzsBS.png",
                                text: "Error: ID out of Range (range: 0-5)"
                            }
                        })]
                    })
                    client.emit("warn", new Error("ID somehow out of range for </job work-shift:1054798487239266361> (Should be 0-5, got " + randomInt + ")"))
            }
        }
    }
}
orderedJobList.map(job => { return { name: job?.name??"unknown job", value: job.value } }).forEach(i => {
    string.addChoices(i)
})
module.exports = example