const { SlashCommandBuilder } = require('discord.js');
const { embedReplyPrimaryColorWithFieldsAndAuthor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Provides information about the current server.")
		.setDMPermission(false),
	async execute(interaction) {
		if(!interaction.inGuild()) {
			const embedReply = embedReplyFailureColor(
				"Server information - Error",
				"This function is only avalible on servers.",
				interaction
			);
		}
		else {
			// const { guild } = interaction;

			const embedReply = embedReplyPrimaryColorWithFieldsAndAuthor(
				"Server information.",
				"",
				[
					{ name: "Creation date", value: interaction.createdAt.toDateString(), inline : true },
					{ name: "Members", value: interaction.memberCount, inline: true },
					{ name: "Owner", value: (await interaction.fetchOwner()).user.tag, inline: true },
					//channel(c).type:
					//0 = text channels
					//2 = voice channels
					//4 = categories
					{ name: "Text channels", value: interaction.channels.cache.filter((c) => c.type === 0).toJSON().length, inline: true },
					{ name: "Voice channels", value: interaction.channels.cache.filter((c) => c.type === 2).toJSON().length, inline: true },
					{ name: "Categories", value: interaction.channels.cache.filter((c) => c.type === 4).toJSON().length, inline: true },
					//size - 1 --> @everyone excluded
					{ name: "Roles (@everyone included)", value: interaction.roles.cache.size, inline: true },
					{ name: "Role list", value: interaction.roles.cache.toJSON().join(", ") },
					{ name: "Server Id", value: interaction.id },
				],
				{ name: interaction.name, iconUrl: interaction.iconURL({ size: 256}) },
				interaction
			);
		}
		
		await interaction.reply({ embeds: [embedReply] });

		const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
	},
};