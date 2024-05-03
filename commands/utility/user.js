const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Provides information about a specified user.")
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("Choose a user.")
				.setRequired(false)),
	async execute(interaction) {
		// interaction.user = user who ran the command
		// interaction.member = a specified user in a guild
		const targetUser = interaction.options.getUser("user") || interaction.user;
		const targetMember = await interaction.guild.members.fetch(targetUser.id);

		const embedReply = new EmbedBuilder({
			color: 0x5F0FD6,
			title: "User information.",
			// thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
			fields: [
				{ name: "Username", value: targetUser.username, inline : true },
				{ name: "Display name", value: targetUser.globalName, inline : true },
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
				// { name: "Is online?", value: targetUser.presence.status === "online", inline : true },
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
			timestamp: new Date().toISOString(),
			footer: {
				text: `Requested by: ${interaction.user.username}` ,
				icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
			},
		});

		await interaction.reply({ embeds: [embedReply]});

		//logging
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.guild.name || "Not in server"} (ID: ${interaction.guild.id || "-"})\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        //console.log(logMessage);

        fs.appendFile("log/command-user.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
	},
};