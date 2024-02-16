const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, time } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Times out a member from the server.")
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
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
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
            var replyContent = "You can only timeout members in a server.";
        }
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
            var replyContent = "Bot **lacks the timeout(aka. mute) permission**, cannot time out the member.";
        }
        else if(isNaN(time)) {
            var replyContent = time;
        }
        else{
            try{
                await targetUser.timeout(time, reason);
                var replyContent = `Successfully timed out user ${targetUser} for **${timeString}**, with reason: **${reason}**`;
            }
            catch (error){
                console.error(error);
                var replyContent = "There was an error trying to time out the user.";
            }
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Timeout.",
            description: `${replyContent}`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });
    }
}    