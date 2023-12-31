const { EmbedBuilder, SlashCommandBuilder, Guild } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Provides information about the current server."),
	async execute(interaction) {
		if(!interaction.inGuild()){
			interaction.reply({content: "only server", ephemeral: true,});
			return;
		}

		const { guild } = interaction;

		const serverInfoEmbed = new EmbedBuilder({
			author: { name: guild.name, iconUrl: guild.iconURL({ size: 256}) },

			fields: [
				{ name: "Creation date", value: guild.createdAt.toDateString(), inline : true },
				{ name: "Owner", value: (await guild.fetchOwner()).user.tag, inline: true },
				//channel(c).type:
				//0 = text channels
				//2 = voice channels
				//4 = categories
				{ name: "Text channels", value: guild.channels.cache.filter((c) => c.type === 0).toJSON().length, inline: true },
				{ name: "Voice channels", value: guild.channels.cache.filter((c) => c.type === 2).toJSON().length, inline: true },
				{ name: "Categories", value: guild.channels.cache.filter((c) => c.type === 4).toJSON().length, inline: true },
				{ name: "Members", value: guild.memberCount, inline: true },
				//size - 1 --> @everyone excluded
				{ name: "Roles (@everyone included)", value: guild.roles.cache.size, inline: true },
				{ name: "Role list", value: guild.roles.cache.toJSON().join(", ") }
			],

			footer: { text: `Server Id: ${guild.id}` }
		});
		
		// await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
		await interaction.reply({ embeds: [serverInfoEmbed] })
	},
};