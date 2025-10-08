const { SlashCommandBuilder } = require("discord.js");
const {
  embedReplyPrimaryColorWithFieldsAndAuthor,
  embedReplyFailureColor,
} = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the current server.")
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      var embedReply = embedReplyFailureColor(
        "Server information - Error",
        "This function is only avalible on servers.",
        interaction
      );
    } else {
      var embedReply = embedReplyPrimaryColorWithFieldsAndAuthor(
        "Server information.",
        "",
        [
          {
            name: "Creation date",
            value: interaction.guild.createdAt.toDateString(),
            inline: true,
          },
          { name: "Members", value: interaction.guild.memberCount, inline: true },
          { name: "Owner", value: (await interaction.guild.fetchOwner()).user.tag, inline: true },
          //channel(c).type:
          //0 = text channels
          //2 = voice channels
          //4 = categories
          {
            name: "Text channels",
            value: interaction.guild.channels.cache.filter((c) => c.type === 0).toJSON().length,
            inline: true,
          },
          {
            name: "Voice channels",
            value: interaction.guild.channels.cache.filter((c) => c.type === 2).toJSON().length,
            inline: true,
          },
          {
            name: "Categories",
            value: interaction.guild.channels.cache.filter((c) => c.type === 4).toJSON().length,
            inline: true,
          },
          //size - 1 --> @everyone excluded
          {
            name: "Roles (@everyone included)",
            value: interaction.guild.roles.cache.size,
            inline: true,
          },
          { name: "Role list", value: interaction.guild.roles.cache.toJSON().join(", ") },
          { name: "Server Id", value: interaction.guild.id },
        ],
        { name: interaction.guild.name, iconUrl: interaction.guild.iconURL({ size: 256 }) },
        interaction
      );
    }

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
