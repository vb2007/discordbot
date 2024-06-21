const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
// const { logToFileAndDatabase } = require("../../logger");
// const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete-invite")
        .setDescription("Deletes one or all invites in the server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) //or maybe CreateInstantInvite would be suiteable
        .setDMPermission(false), //so it cannot be used in DMs
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var replyContent = "You can only delete invites in a server."
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administartor)) {
            var replyContent = "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges."
        }
        else {
            try {
                //currently, it just deletes all invites
                //i would like to make a confirmation menu for that command (and also for some others)
                //..and a menu that lists all invites, and lets an admin delete a specific one fromm there (or all of them, with a "Delete all" button)
                message.guild.invites.fetch().then(invites => {
                    invites.each(i => i.delete())
                }); //some lines i stole from stackoverflow
                var replyContent = "Deleted all invites in this server successfully.";
            }
            catch (error) {
                console.error(error);
            }
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Deleting invite(s).",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        // const response = JSON.stringify(embedReply.toJSON());
		// await logToFileAndDatabase(interaction, response);
    },
};