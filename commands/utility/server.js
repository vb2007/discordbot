const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { logToFileAndDatabase } = require("../../logger");
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Provides information about the current server."),
	async execute(interaction) {
		if(!interaction.inGuild()) {
			var authorField = {};
			var embedFields = [];
			var embedDescription = "This function is only avalible on servers.";
		}
		else {
			const { guild } = interaction;

			var authorField = { name: guild.name, iconUrl: guild.iconURL({ size: 256}) }
			var embedFields = [
				{ name: "Creation date", value: guild.createdAt.toDateString(), inline : true },
				{ name: "Members", value: guild.memberCount, inline: true },
				{ name: "Owner", value: (await guild.fetchOwner()).user.tag, inline: true },
				//channel(c).type:
				//0 = text channels
				//2 = voice channels
				//4 = categories
				{ name: "Text channels", value: guild.channels.cache.filter((c) => c.type === 0).toJSON().length, inline: true },
				{ name: "Voice channels", value: guild.channels.cache.filter((c) => c.type === 2).toJSON().length, inline: true },
				{ name: "Categories", value: guild.channels.cache.filter((c) => c.type === 4).toJSON().length, inline: true },
				//size - 1 --> @everyone excluded
				{ name: "Roles (@everyone included)", value: guild.roles.cache.size, inline: true },
				{ name: "Role list", value: guild.roles.cache.toJSON().join(", ") },
				{ name: "Server Id", value: guild.id },
			];
		}

		const embedReply = new EmbedBuilder({
			color: 0x5F0FD6,
			title: "Server information.",
			description: embedDescription,
			author: authorField,
			fields: embedFields,
			timestamp: new Date().toISOString(),
			footer: {
				text: `Requested by: ${interaction.user.username}` ,
				icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
			}
		});
		
		await interaction.reply({ embeds: [embedReply] });

		const response = `Replied with: ${embedReply}`;
		await logToFileAndDatabase(interaction, response);
		// //logging
        // const logMessage =
        //     `Command: ${interaction.commandName}\n` +
        //     `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
        //     `Server: ${interaction.inGuild() ? `${interaction.guild.name} (ID: ${interaction.guild.id})` : "Not in a server." }\n` +
        //     `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        // //console.log(logMessage);

        // fs.appendFile("log/command-server.log", logMessage, (err) => {
        //     if (err) {
        //         console.error("Error while writing the logs: ", err);
        //     }
        // });
	},
};