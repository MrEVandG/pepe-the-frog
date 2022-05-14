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

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

const commands = []

client.commands = new Collection()

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
    client.commands.set(command.data.name, command)
}

client.once("ready", () => {
    console.log("The bot is ready!!")

    const CLIENT_ID = client.user.id

    const rest = new REST({
        version: "9"
    }).setToken(process.env.TOKEN);
    
    (async () => {
        try {
            if (process.env.ENV==="production") {
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

client.on("interactionCreate",async interaction=>{
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    try {
        await command.execute(interaction,client,db)
    } catch (err) {
        if (interaction.replied||interaction.deferred) interaction.editReply("The code errored")
        else interaction.reply("The code errored")
        console.log(err)
    }
})

client.login(process.env.TOKEN)