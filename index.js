const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
//const { Routes } = require('discord-api-types/v9');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//szól ha kész a kliens
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

//kiszedi a parancsokat a commands mappából és annak almappáiból
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		//commandok adatainak beállítása
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		//logolja ha egy parancsnak nincs data vagy execute értéke
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//perjeles parancsok kezelése
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	//nincs ilyen parancs
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	//parancs futtatása
	try {
		await command.execute(interaction);
	}
	//hiabkezelés
	catch (error) {
		console.error(error);

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on('ready', (c) => {
    client.user.setActivity({
		status: 'online',
		type: ActivityType.Playing,
		name: 'Femboys are attractive as fuck.',
    });
});

//log mappát hoz létre ha nem létezik
const logDirectory = path.join(__dirname, "log");
if(!fs.existsSync(logDirectory)){
	fs.mkdirSync(logDirectory, { recursive: true });
}

//tokennel bejelentkezik
client.login(token);