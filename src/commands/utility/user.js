const { SlashCommandBuilder } = require("discord.js");
const {
  embedReplyPrimaryColorWithFieldsAndThumbnail,
} = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about a specified user.")
    .addUserOption((option) =>
      option.setName("user").setDescription("Choose a user.").setRequired(false)
    )
    .setDMPermission(false),
  async execute(interaction) {
    // interaction.user = user who ran the command
    // interaction.member = a specified user in a guild
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const targetMember = await interaction.guild.members.fetch(targetUser.id);

    const embedReply = embedReplyPrimaryColorWithFieldsAndThumbnail(
      "User information.",
      [
        {
          name: "Username",
          value: targetUser.username || "None",
          inline: true,
        },
        {
          name: "Display name",
          value: targetUser.globalName || "None",
          inline: true,
        },
        {
          name: "Nickname",
          value: targetMember.nickname || "None",
          inline: true,
        },
        {
          name: "Joined",
          value: `<t:${parseInt(targetMember.joinedAt / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Created",
          value: `<t:${parseInt(targetUser.createdAt / 1000)}:R>`,
          inline: true,
        },
        { name: "Roles", value: targetMember.roles.cache.toJSON().join(" ") },
        { name: "Highest role", value: targetMember.roles.highest.name },
        // { name: "Permissions", value: targetMember.permissions.toArray().join(", "), inline : true },
        { name: "User Id", value: targetUser.id, inline: true },
        { name: "Bot?", value: targetUser.bot, inline: true },
        {
          name: "Custom presence",
          value:
            targetMember.presence?.activities
              ?.map((activity) => `${activity.type === 4 ? activity.state : activity.name}`)
              .join(", ") || "No presence",
        },
        {
          name: "Status",
          value: targetMember.presence?.status || "Offline",
          inline: true,
        },
      ],
      targetMember.displayAvatarURL({ dynamic: true }),
      interaction
    );

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
