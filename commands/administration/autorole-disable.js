const { EmbedBuilder, SlashCommandBuilder, PermissionFlagBits } = require("discord.js");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole-disable")
        .setDescription("Disables the role that is automatically assigned to new members on join.")
        .setDefaultMemberPermissions(PermissionFlagBits.Administartor),
    async execute(interaction) {
        try {
            let currentGuildId = interaction.guild.id;
            let autoroleGuildId = await db.query("SELECT guildId FROM autorole WHERE guildId = ?", [currentGuildId]);
            if (autoroleGuildId == currentGuildId) {

            }
            else {

            }

            var embedReply = new EmbedBuilder({
                color: 0x5F0FD6,
                title: "Disabling autorole.",
                description: replyContent,
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Requested by: ${interaction.user.username}` ,
                    icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
                },
            });

            await interaction.reply({ embeds: [embedReply] });
        } catch (error) {
            console.log(error);
        }
    }
}