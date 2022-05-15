require("dotenv").config()
const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { Client, Intents, Collection, DiscordAPIError, MessageEmbed } = require("discord.js")
const JSONdb = require('simple-json-db');
const db = new JSONdb('./database.json');

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
})

const commandFilenames = fs.readdirSync("./commands")
console.log(commandFilenames, commandFilenames[0].hasOwnProperty("endsWith"))
const commands = []

client.commands = new Collection()

for (const filename of commandFilenames) {
    if (filename.endsWith(".js")) {
        const command = require(`./commands/${filename}`)
        commands.push(command.data.toJSON())
        client.commands.set(command.data.name, command)
        continue
    }

    fs.readdirSync("./commands/" + filename).forEach(file => {
        const command = require(`./commands/${filename}/${file}`)
        client.commands.set(command.data.name, command.data)
    })

}

client.once("ready", () => {
    console.log("The bot is ready!!")

    const CLIENT_ID = client.user.id

    const rest = new REST({
        version: "9"
    }).setToken(process.env.TOKEN);

    (async () => {
        try {
            if (process.env.ENV === "production") {
                await rest.put(Routes.applicationCommands(CLIENT_ID), {
                    body: commands
                })
                console.log(`${commands.length} commands have been updated globally.`)
            } else {
                await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {
                    body: commands
                })
                console.log(`${commands.length} commands have been updated locally.`)
            }
        } catch (err) {
            if (err) console.error(err)
        }
    })()
})

client.on("interactionCreate", interaction => {
    const interactionCreate = require("./events/interactionCreate")
    interactionCreate(interaction, client, db)
})

client.login(process.env.TOKEN)