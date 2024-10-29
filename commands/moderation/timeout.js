const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embedReplySuccessColor, embedReplyFailureColor } = require('../../helpers/embeds/embed-reply');
const { moderationDmEmbedReplyFailureColor } = require('../../helpers/embeds/embed-reply-moderation');
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Times out a specified member for a specified time.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Choose your target.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("time")
                .setDescription("Specify the time in seconds (s), minutes (m), hours (h), or days (d). For example: 12m")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Give a reason.")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getMember("target");
        const timeInput = interaction.options.getString("time");
        const reason = interaction.options.getString("reason") || "No reason provided";

        function timeInMs(timeInput) {
            const units = timeInput.slice(-1);
            const time = parseInt(timeInput.slice(0, -1));
            let timeString = "";
            
            if (time === 0) {
                return ["Time cannot be zero.", ""]
            }

            switch(units) {
                case "s":
                    timeString = time === 1 ? `${time} second` : `${time} seconds`;
                    return [time * 1000, timeString];
                case "m":
                    timeString = time === 1 ? `${time} minute` : `${time} minutes`;
                    return [time * 1000 * 60, timeString];
                case "h":
                    timeString = time === 1 ? `${time} hour` : `${time} hours`;
                    return [time * 1000 * 60 * 60, timeString];
                case "d":
                    timeString = time === 1 ? `${time} day` : `${time} days`;
                    return [time * 1000 * 60 * 60 * 24, timeString];
                default:
                    return ["Invalid time unit. Please use **s**, **m**, **h**, or **d**.", ""];
            }
        }

        const [ time, timeString ] = timeInMs(timeInput);

        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Timeout - Error",
                "You can only timeout members in a server.",
                interaction
            );
        }
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
            var embedReply = embedReplyFailureColor(
                "Timeout - Error",
                "Bot **lacks the timeout(aka. mute) permission**, cannot time out the member.",
                interaction
            );
        }
        else if(isNaN(time)) {
            var embedReply = embedReplyFailureColor(
                "Timeout - Error",
                time,
                interaction
            );
        }
        else{
            try{
                await targetUser.timeout(time, reason);

                var replyContent = `Successfully timed out user ${targetUser} for **${timeString}**, with reason: **${reason}**`;

                try{
                    var embedDmReply = moderationDmEmbedReplyFailureColor(
                        "You have been timed out.",
                        `You have been timed out in **${interaction.guild.name}** for **${timeString}**, because of: **${reason}** \nIf you believe this was a mistake, please contact a moderator.`,
                        interaction
                    );

                    await targetUser.send({ embeds: [embedDmReply] });
                    replyContent += "\nThe user was notified about the action & reason in their DMs.";
                }
                catch (error){
                    console.error(error);
                    replyContent += "\nThere was an error while trying to DM the user.";
                }

                var embedReply = embedReplySuccessColor(
                    "Timeout - Success",
                    replyContent,
                    interaction
                );
            }
            catch (error){
                console.error(error);
                var embedReply = embedReplyFailureColor(
                    "Timeout - Error",
                    "There was an error while trying to time out the user.",
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}    