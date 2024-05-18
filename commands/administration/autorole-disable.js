const { EmbedBuilder, SlashCommandBuilder, PermissionFlagBits } = require("discord.js");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole-disable")
        .setDescription("Disables the role that is automatically assigned to new members on join.")
        .setDefaultMemberPermissions(PermissionFlagBits.Administartor),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var replyContent = "You can only disable autorole in a server."
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administartor)) {
            var replyContent = "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges."
        }
        else {
            try {
                let currentGuildId = interaction.guild.id;
                let autoroleGuildId = await db.query("SELECT guildId FROM autorole WHERE guildId = ?", [currentGuildId]);

                if (autoroleGuildId == currentGuildId) {
                    await db.query("DELETE FROM autorole WHERE guildId = ?", [autoroleGuildId]);

                    var replyContent = "The autorole feature has been disabled succesfully.\nYou can re-enable it with `/autorole-configure`."
                }
                else {
                    var replyContent = "Autorole has not been configured for this server.\nTherefore, you can't disable it."
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
    },
};