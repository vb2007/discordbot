// Import modules
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
console.log("client created");

client.once('ready', () => {
  console.log('Ready!');
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
      message.channel.send('Pong!');
  }
});

const token = process.env.TOKEN;
console.log("token processed");
client.login(token);
console.log("logged in");

const clientId = process.env.CLIENTID;
console.log("clientid set")

client.on('ready', (c) => {
  client.user.setActivity({
    name: 'Support the Resistance, make the frogs cry.',
    type: ActivityType.Playing,
    url: 'http://vb2007.hu',
  });
});

const pingCommand = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!\nJust for the fucking active developer badge.\nI hate slash commands.');
    }
});

// Create a rest instance
const rest = new REST({ version: '9' }).setToken(token);

// Register the ping command as a global command
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [pingCommand.toJSON()] },
    );

    console.log('Successfully reloaded application (/) commands.');
  }
  catch (error) {
    console.error(error);
  }
})();