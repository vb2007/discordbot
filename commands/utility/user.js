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
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const targetUser = interaction.options.getUser("user");

		const reply = new EmbedBuilder()
			.setColor(0x07669D)
			.setTitle("User information.")
			.setDescription(`Command ran by: ${interaction.user.username}.`)
			.setDescription(`User joined the sevrer on ${interaction.member.joinedAt}`)
			.setFooter(Date());

		await interaction.reply({ embeds: [reply]});
		//await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	},
};