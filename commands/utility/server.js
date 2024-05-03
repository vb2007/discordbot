const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Provides information about the current server."),
	async execute(interaction) {
		if(!interaction.inGuild()){
			interaction.reply({content: "This function is only avalible on servers. Sowwy :(", ephemeral: true,});
			return;
		}

		const { guild } = interaction;
		const embedReply = new EmbedBuilder({
			color: 0x5F0FD6,
			author: { name: guild.name, iconUrl: guild.iconURL({ size: 256}) },
			fields: [
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
			],
			timestamp: new Date().toISOString(),
			footer: {
				text: `Requested by: ${interaction.user.username}` ,
				icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
			}
		});
		
		await interaction.reply({ embeds: [embedReply] });
	},
};