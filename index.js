const fs = require("node:fs");
const path = require("node:path");

require('dotenv').config();
const token = process.env.TOKEN;

//checks database connection
const db = require("./helpers/db");
db.getConnection();

//verifies the config.json file's syntax
require("./scripts/verify-config-syntax");
// validateConfig();

const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require("discord.js");

const client = new Client({ intents: 
	[
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	]
});

//notifies owner on console if the app is ready
client.once(Events.ClientReady, readyClient => {
	console.log(`Bot is ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

//gets command from the "/commands" folder's subfolders
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		//sets command names and data
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		}
		//logs if a command doesn't has a critical information
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//gets event listeners from the "/events" folder
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	console.log("Event: ", event);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

//haldes slash commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	//if there is no such command...
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	//handling interactions
	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
		}
		else {
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	}
});

client.on('error', error => {
	console.error("The WebSocket encountered an error: ", error);
});

client.on('shardError', error => {
    console.error('A WebSocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

//sets the bot's discord activity
function setActivity() {
	client.user.setActivity({
		status: "online",
		type: ActivityType.Playing,
		name: "with stolen user data.",
	});
	// console.log("Re-announced bot's activity.");
}

client.on("ready", () => {
	setActivity();
});

//re-announces the bot's activity in every 20 minutes (in case of an internet outage or something)
setInterval(setActivity, 20 * 60 * 1000);

//logs in with given token
client.login(token);