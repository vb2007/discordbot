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

const token = process.env.TOKEN;
console.log("token processed");
client.login(token);
console.log("logged in");

const clientId = process.env.CLIENTID;
console.log("clientid set")

client.on('ready', (c) => {
  client.user.setActivity({
    name: 'Femboys are attractive as fuck.',
    type: ActivityType.Playing,
    url: 'https://vb2007.hu/ref/D0ld',
  });
});


const pingCommand = new SlashCommandBuilder()
.setName('ping')
.setDescription('Replies with Pong!');

const feetCommand = new SlashCommandBuilder()
.setName('skellylaba')
.setDescription('Küld egy képet Skelly lábáról.');

const pyCommand = new SlashCommandBuilder()
.setName('py')
.setDescription('facts.');

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
      await interaction.reply('Pong!\nJust for the fucking active developer badge.\nI hate slash commands.');
    }

    if (commandName === 'skellylaba') {
      await interaction.reply('Skelly szőrös lába :hot_face: :https://cdn.discordapp.com/attachments/1177710851344564234/1177710869371687035/image.png');
    }

    if (commandName === 'py') {
      await interaction.reply('.py egy autista geci (és nem küld képet a lábáról)');
    }
});

// Create a rest instance
const rest = new REST({ version: '9' }).setToken(token);

module.exports = {
  data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kicks a user from the server.')
      .addUserOption(option => 
          option.setName('target')
              .setDescription('The user to kick')
              .setRequired(true)
      ),
  async execute(interaction) {
      const user = interaction.options.getUser('target');
      const member = interaction.guild.members.resolve(user);
      
      if (!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
          return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      if (!member) {
          return interaction.reply({ content: 'User is not a member of this server.', ephemeral: true });
      }

      if (!member.kickable) {
          return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
      }

      await member.kick();
      return interaction.reply({ content: `Successfully kicked ${user.tag}` });
  },
};

// Register the ping command as a global command
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      {body: [
        pingCommand.toJSON(),
        feetCommand.toJSON(),
        pyCommand.toJSON()
      ]},
    );

    console.log('Successfully reloaded application (/) commands.');
  }
  catch (error) {
    console.error(error);
  }
})();