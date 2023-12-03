require("dotenv").config()

const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const discord = require("discord.js")
const quickdb = require("quick.db")
const ItemsList = require("./utils/items.json")
const JobsList = require("./utils/jobs.json")


Array.prototype.shuffle = function () {
    return this.sort(() => Math.random() - 0.5)
}

const client = new discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
})
let warningWebhook = new discord.WebhookClient({
    url: process.env.WARNINGLOG,
    token: process.env.WARNINGLOGTOKEN
})
client.warningWebhook = warningWebhook //? Storing stuff in the client so the interaction command doesn't have 100 parameters :/
const commandFilenames = fs.readdirSync("./commands")
const commands = []
const privateCommands = []
client.commands = new discord.Collection() // BRUH WHY DOESNT IT WORK
const db = new quickdb.QuickDB({ filePath: "start.sqlite" })
db.set("name", "$")
// Append each command file to the array
for (const filename of commandFilenames) {
    if (filename.endsWith(".js")) {
        const file = require(`./commands/${filename}`)
        commands.push(file.data.toJSON())
        client.commands.set(file.data.name, file)
        continue
    }
    fs.readdirSync("./commands/" + filename).forEach(file => {
        if (file.endsWith(".md") || file.endsWith(".txt") || filename == "temp") // You don't register these. (text files are for folder descriptions)
            return;
        if (!file.endsWith(".js")) {
            throw new Error("only JavaScript files are allowed")
        }
        const command = require(`./commands/${filename}/${file}`)
        client.commands.set(command.data.name, command);
        if (filename == "private") {
            privateCommands.push(command.data.toJSON())
        } else {
            commands.push(command.data.toJSON())
        }
    })
}
// Add some money when you chat something. Just something neat.
client.on('messageCreate', async message => {
    if (message.author.bot) return
    const messageCreate = require("./events/messageCreate")
    messageCreate(message, db, client)
})
// Upload the commands to Discord's GARBAGE server
client.once("ready", async () => {
    
    const client_ID = process.env.CLIENT_ID

    const rest = new REST({
        version: "9"
    }).setToken(process.env.TOKEN);

    (async () => {
        try {
            await rest.put(Routes.applicationCommands(client_ID), {
                body: commands
            })
            console.log(`🟢 ${commands.length} commands have been updated globally.`)
            await rest.put(Routes.applicationGuildCommands(client_ID, process.env.GUILD_ID), {
                body: privateCommands
            })
            console.log(`🟠 ${privateCommands.length} private commands have been updated locally.`)
            console.log(`🟡 ${commands.length + privateCommands.length} commands have been globally and locally updated.`)
            console.log("🟩 The bot and its commands are fully ready!!")
        } catch (err) {
            if (err) console.error(err)
        }
    })()
})
const utils = { items: ItemsList, jobs: JobsList }
// Basically for when you want to run a command.
// I don't know why I put the terribly short code in a seperate file.
client.on("interactionCreate", interaction => {
    const interactionCreate = require("./events/interactionCreate")
    interactionCreate(interaction, client, db, utils)
})

client.login(process.env.TOKEN) //: This is how it all starts :)
// When commands run across a user who is not registered in the server or lacks a property,
// they run this "db.failsafe()" command to set things up so you don't have to manually.
/**
 * 
 * @param {User|Number} user 
 * @returns Returns a promise that resoles when all failsafes are complete.
 * That's kind of how `Promises.all` works.
 */
db.failSafe = async function (user) {
    let userId = ""
    switch (typeof user) {
        case "number":
            userId = user.toString()
            break;
        case "object":
            userId = user.id
            break;
        case "string":
            userId = user
    }
    const promises = [db.add(`users.${userId}.currency`, 0),
    db.add(`users.${userId}.xp`, 0),
    db.set(`users.${userId}.id`, userId),
    db.add(`users.${userId}.job.shifts`, 0)]
    if (!await db.get(`users.${userId}.job.job`)) promises.push(db.set(`users.${userId}.job.job`, "unemployed")) // New feature added, use the failsafe. But don't get rid of the job.
    return Promise.all(promises)
}
module.exports = { client, db, utils }

// Every day at UTC Midnight, run over all of the users and reset both their daily's, monthly's (if it's the 1st) and job shifts.

async function waitTillMidnight() {
    let now = new Date()
    now.setUTCDate(now.getUTCDate() + 1) //? Looking back on THIS specifically, I don't know why this breaks. I usually never have the patience to wait until midnight UTC anyway to test it.
    now.setUTCHours(0, 0, 0, 0)
    let timeToWaitMS = now - Date.now()
    console.warn(`${Math.floor(timeToWaitMS / 1000 / 60 / 60)}:${Math.floor((timeToWaitMS / 1000) / 60) % 60 + 1} minutes 'til UTC midnight!!`); // Usually broken
    await new Promise(r => setTimeout(r, timeToWaitMS))
    const users = Object.values(await db.get("users")) // Lets hope i dont run out of RAM
    console.log("Resetting shifts...")
    let usersToFire = users.filter(user => user.job.job != "unemployed" && user.job.job && user.job.shiftsToday < JobsList.find(job => job.value == user.job.job).shiftsperday) // returns a list of users who are employed and have not worked their shifts
    const promises = []
    usersToFire.forEach(user => promises.push(db.set(`users.${user.id}.job.job`, `ueoos-${user.job.job}-${user.job.shiftsToday}-${now.getTime()}`),db.set(`users.${user.id}.job.shiftsToday`, 0)))
    Promise.all(promises)
    waitTillMidnight()
    //? Looking back on it, I have no idea how this works- all I know is not to touch it.
}
waitTillMidnight()

//: Errors and warnings

client.on("error", msg => {
    //- This is probably an error *object*, although it can be a string, too. Error objects have a "trace" property I can use!
    let fields = [{name:"No Stack",value:"No stack trace was provided."}]
    if (splitErrorMessageStack(msg?.trace??msg)) {
        fields = []
        for (const [key, value] of Object.entries(splitErrorMessageStack(msg?.trace??msg))) {
            fields.push({name:key,value})
        }
    }
    warningWebhook.send({
        embeds: [new discord.MessageEmbed({
            color: "RED",
            title: `Error: ${msg.message??msg.split("at ")[0]}`,
            description: `@everyone Something errored! ${
                msg.message ?? (msg.split("at ")[0]!=undefined
                ? (`Details sent by API: ${msg.split("at ")[0]}`)
                :"No error message was provided.")
            }`,
            fields,
            timestamp: new Date()
        })]
    })
})
client.on("warn", msg => {
    warningWebhook.send({
        embeds: [new discord.MessageEmbed({
            color: "ORANGE",
            title: "Warning",
            description: "@everyone Details sent by API: " + msg,
            timestamp: new Date()
        })]
    })
})
let stopAllLogs = true
let heartbeats = []
client.on("debug", msg => {
    //! wtf is a heartbeat?
    //! you learn something new every day, right?
    //! because today I learned to IGNORE ALL THE "HEARBEAT" MESSAGES SENT BY DISCORD OMGGGGGGGGGGGGGGGGGGGGG
    //! oh also the fact it spams about 12 debug messages on start
    if (msg.includes("fully ready")) {
        stopAllLogs = false;
        return warningWebhook.send({
            embeds: [new discord.MessageEmbed({
                color: "GREEN",
                title: "Bot is ready!!",
                description: "@everyone Just got the message that the bot is started. Woo-hoo!",
                timestamp: new Date()
            })]
        }) //? Return here because I don't need discord to say "Fully ready" if i do it myself.
    }
    if (stopAllLogs) return; // discord spews ~11 debug messages when it logs in it's very annoying
    if (msg.includes("Sending a heartbeat")) return; // I don't need to know that if you send another message
    if (msg.includes("Heartbeat acknowledged")) {
        heartbeats.push({time:Math.floor(Date.now()/1000),duration:msg.split(" ")[msg.split(" ").length-1].slice(0,-1)})
        if (heartbeats.length == 10) {
            warningWebhook.send({embeds:[{
                title: "Hearbeats",
                description: `10 heartbeats over a timespan of ${heartbeats[9].time-heartbeats[0].time} seconds were sent. Here is how long they took.`,
                fields: heartbeats.map((heartbeat)=>{
                    return { name: heartbeat.duration, value: `<t:${heartbeat.time}:T> - ${heartbeat.duration}` }
                }),
                timestamp: new Date()
            }]})
            heartbeats = []
        }
        return
    }
    if (msg=="send-all-heartbeats") {
        if (heartbeats.length==0) return;
        warningWebhook.send({embeds:[{
            title: "Hearbeats",
            description: `The bot has crashed or a dev has asked, so all ${heartbeats.length} heartbeats over a timespan of ${heartbeats[heartbeats.length-1].time-heartbeats[0].time} seconds were sent. Here is how long they took.`,
            fields: heartbeats.map((heartbeat)=>{
                return { name: heartbeat.duration, value: `<t:${heartbeat.time}:T> - ${heartbeat.duration}` }
            }),
            timestamp: new Date()
        }]})
        heartbeats = []
        return;
    }
    let fields = []
    let title = "Debug Log"
    let descriptionDetails = msg
    // Why C:\ ? I am a windows user, of course!
    // I wish I had linux, but i don't wanna touch anything 😅
    if (splitErrorMessageStack(msg?.trace??msg)&&msg.includes("C:\\")&&msg.includes("at")) {
        title = "Debug Log with Error"
        if (msg.includes("Manager was destroyed")) {
            title = "Debug Log: Client Destroyed"
            stopAllLogs = true
        }
        descriptionDetails = msg.split("at ")[0]
        for (const [key, value] of Object.entries(splitErrorMessageStack(msg?.trace??msg))) {
            fields.push({name:key,value})
        }
    }
    warningWebhook.send({
        embeds: [new discord.MessageEmbed({
            color: "GREY", //? ew europe spelling (i thought discord was american)
            title,
            description: "Details sent by Discord: " + descriptionDetails,
            fields
        })]
    })
})
// uhhhhhhhhhh
// i forgot what this did
// and i am too scared to touch it

function splitErrorMessageStack(stackTrace) {
    // Splits an error message stack trace into its error name and filepath
    let positions = {}
    if (typeof stackTrace == "object") {
        stackTrace = stackTrace.stack
    }
    let functions = stackTrace.split("at ")
    functions.shift()
    for (const stack of functions) {
        if (stack.includes("node_modules")||stack.includes("node:")) continue;
        let path = stack.replaceAll("\n","").trim().slice(stack.lastIndexOf("(")+1,stack.lastIndexOf(")")).split(":")
        let filePath = path[0].concat(path[1]) //  This is because file paths start with "C:\" and then the second part is ".js:ln:cn"
        positions["Function ".concat(stack.slice(0,stack.lastIndexOf("(")-1))]=`\`${filePath}\` line ${path[2]} col ${path[3]}`
    }
    return positions
}

