const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Provides information about a user.")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("Choose a user.")
				.setRequired(false)),
	async execute(interaction) {
		// interaction.user = user who ran the command
		// interaction.member = a specified user in a guild
		const targetUser = interaction.options.getUser("user");

		const embedReply = new EmbedBuilder({
			color: 0x5F0FD6,
			title: "User information.",
			fields: [
				{ name: "Username", value: interaction.user.username, inline : true },
				{ name: "Joined at", value: interaction.member.joinedAt.toDateString(), inline: true },
			],
			timestamp: new Date().toISOString(),
			footer: {
				text: `Requested by: ${interaction.user.username}` ,
				icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
			},
		});

		await interaction.reply({ embeds: [embedReply]});
	},
};