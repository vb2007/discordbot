const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require("discord.js");
//const { Routes } = require('discord-api-types/v9');
const { token } = require("./config.json");
const db = require("./db")

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//logs if client is ready
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
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

//sets bot's discord activity
client.on("ready", (c) => {
    client.user.setActivity({
		status: "online",
		type: ActivityType.Playing,
		name: "with stolen user data.",
    });
});

//creates log directorty if it isn't exists already
const logDirectory = path.join(__dirname, "log");
if(!fs.existsSync(logDirectory)){
	fs.mkdirSync(logDirectory, { recursive: true });
}

//closes connection to the database when closing the application
client.on("SIGINT", () => {
	console.log("Closing MariaDB database pool connection(s)...");
	db.end();
	client.exit(0);
})

//logs in with given token
client.login(token);