require("dotenv").config()
const { Op } = require('sequelize');
const { Users, CurrencyShop } = require('./dbObjects.js');
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
const commands = []

const currency = new Collection()
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
        commands.push(command.data.toJSON())
        client.commands.set(command.data.name, command)
    })
}

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	currency.add(message.author.id, 1);
});

client.once("ready", async () => {
    console.log("The bot is ready!!")
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));

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
    interactionCreate(interaction, client, currency, Users, CurrencyShop)
})

client.login(process.env.TOKEN)

Reflect.defineProperty(currency, 'add', {
	value: async (id, amount) => {
		const user = currency.get(id);

		if (user) {
			user.balance += Number(amount);
			return user.save();
		}

		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);

		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: id => {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

Reflect.defineProperty(currency, "name", {value: "$"})