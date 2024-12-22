const { SlashCommandBuilder } = require('discord.js');
const { embedReplyPrimaryColorWithFields } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Provides information about a specified user.")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("Choose a user.")
				.setRequired(false))
		.setDMPermission(false),
	async execute(interaction) {
		// interaction.user = user who ran the command
		// interaction.member = a specified user in a guild
		const targetUser = interaction.options.getUser("user") || interaction.user;
		const targetMember = await interaction.guild.members.fetch(targetUser.id);

		const embedReply = embedReplyPrimaryColorWithFields(
			"User information.",
			"",
			[
				{ name: "Username", value: targetUser.username || "None", inline : true },
				{ name: "Display name", value: targetUser.globalName || "None", inline : true },
				{ name: "Nickname", value: targetMember.nickname || "None", inline : true },
				{ name: "Avatar", value: `${targetMember.displayAvatarURL({ dynamic: true })}` },
				{ name: "Joined at", value: `<t:${parseInt(targetMember.joinedAt / 1000)}:R>`, inline: true },
				{ name: "Created at", value: `<t:${parseInt(targetUser.createdAt / 1000)}:R>`, inline: true },
				{ name: "Roles", value: targetMember.roles.cache.toJSON().join(" ") },
				{ name: "Highest role", value: targetMember.roles.highest.name },
				// { name: "Permissions", value: targetMember.permissions.toArray().join(", "), inline : true },
				// { name: "Status", value: usersStatus, inline : true },
				// { name: "Activity", value: targetMember.presence?.activities[0] ? targetMember.presence.activities[0] : "None", inline : true },
				{ name: "Bot?", value: targetUser.bot, inline : true },
				{ name: "User Id", value: targetUser.id, inline: true },
				{ name: "Custom status", value: targetUser.presence || "No status", inline : true },
				// { name: "Is dnd?", value: targetUser.presence.status === "dnd", inline : true },
				// { name: "Is idle?", value: targetUser.presence.status === "idle", inline : true },
				// { name: "Is offline?", value: targetUser.presence.status === "offline", inline : true },
				// { name: "Is invisible?", value: targetUser.presence.status === "invisible", inline : true },
				// { name: "Is streaming?", value: targetUser.presence.activities[0]?.type === "STREAMING", inline : true },
				// { name: "Is listening?", value: targetUser.presence.activities[0]?.type === "LISTENING", inline : true },
				// { name: "Is playing?", value: targetUser.presence.activities[0]?.type === "PLAYING", inline : true },
				// { name: "Is watching?", value: targetUser.presence.activities[0]?.type === "WATCHING", inline : true },
				// { name: "Is custom status?", value: targetUser.presence.activities[0]?.type === "CUSTOM_STATUS", inline : true },
				// { name: "Is competing?", value: targetUser.presence.activities[0]?.type === "COMPETING", inline : true },
			],
			interaction
		);

		await interaction.reply({ embeds: [embedReply]});
		await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
	},
};