const fs = require("node:fs");
const path = require("node:path");

require('dotenv').config();
const token = process.env.TOKEN;
if (!token) {
	console.error("[FATAL] Discord bot token is missing. Please set TOKEN in your .env file.");
	process.exit(1);
}

// Check database connection
const db = require("./helpers/db");
try {
	db.getConnection();
} catch (err) {
	console.error("[FATAL] Database connection failed:", err);
	process.exit(1);
}

// Verify config.json file's syntax
try {
	require("./scripts/verify-config-syntax");
} catch (err) {
	console.error("[FATAL] Config verification failed:", err);
	process.exit(1);
}


const { Client, Collection, Events, GatewayIntentBits, Partials, ActivityType } = require("discord.js");

const { runDarwinProcess } = require('./helpers/darwin/darwinProcess');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		// GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		// GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
    	GatewayIntentBits.GuildWebhooks,
		// GatewayIntentBits.DirectMessages,
		// GatewayIntentBits.DirectMessageTyping,
		// GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.MessageContent,
	],
	partials: [
		Partials.Channel,
		Partials.GuildMember,
		Partials.GuildScheduledEvent,
		Partials.Message,
		Partials.Reaction,
		Partials.ThreadMember,
		Partials.User,
	],
	// allowedMentions: {
	//     parse: ["everyone", "roles", "users"],
	// },
});


// Notify hoster on console if the app is ready
client.once(Events.ClientReady, readyClient => {
	console.log(`Bot is ready! Logged in as ${readyClient.user.tag}`);
	console.log('Initializing Darwin video processing system...');

	// Run Darwin process every 60 seconds
	const darwinInterval = 60_000;
	setInterval(async () => {
		console.log('Running Darwin process check...');
		try {
			await runDarwinProcess(client);
		}
		catch (error) {
			console.error('Error in Darwin process:', error);
		}
	}, darwinInterval);
});

client.commands = new Collection();


// Load commands from the /commands folder's subfolders
const foldersPath = path.join(__dirname, "commands");
let commandFolders = [];
try {
	commandFolders = fs.readdirSync(foldersPath);
} catch (err) {
	console.error(`[FATAL] Could not read commands directory: ${foldersPath}`, err);
	process.exit(1);
}

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	let commandFiles = [];
	try {
		commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
	} catch (err) {
		console.warn(`[WARNING] Could not read commands subdirectory: ${commandsPath}`, err);
		continue;
	}
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		try {
			const command = require(filePath);
			if ("data" in command && "execute" in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		} catch (err) {
			console.warn(`[WARNING] Failed to load command at ${filePath}:`, err);
		}
	}
}


// Load event listeners from the /events folder
const eventsPath = path.join(__dirname, "events");
let eventFiles = [];
try {
	eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
} catch (err) {
	console.error(`[FATAL] Could not read events directory: ${eventsPath}`, err);
	process.exit(1);
}

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	try {
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(client, ...args));
		} else {
			client.on(event.name, (...args) => event.execute(client, ...args));
		}
	} catch (err) {
		console.warn(`[WARNING] Failed to load event at ${filePath}:`, err);
	}
}


// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(`[ERROR] While executing command ${interaction.commandName}:`, error);
		const errorMsg = { content: "There was an error while executing this command!", ephemeral: true };
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
		}
		else {
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	}
});


client.on('error', error => {
	console.error("[ERROR] The WebSocket encountered an error:", error);
});

client.on('shardError', error => {
	console.error('[ERROR] A WebSocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
	console.error('[ERROR] Unhandled promise rejection:', error);
});


// Set the bot's Discord activity
function setActivity() {
	if (!client.user) return;

	client.user.setActivity({
		status: "online",
		type: ActivityType.Playing,
		name: "with stolen user data.",
	});

	// console.log("Re-announced bot's activity.");
}

client.on("ready", setActivity);

// Re-announce the bot's activity every 20 minutes (in case of an internet outage or something)
setInterval(setActivity, 20 * 60 * 1000);

// Log in with the given token
client.login(token).catch(err => {
	console.error("[FATAL] Failed to login to Discord:", err);
	process.exit(1);
});