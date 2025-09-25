const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {
  embedReplyFailureColor,
  embedReplySuccessColor,
  embedReplySuccessSecondaryColor,
  embedReplyWarningColor,
} = require("../../helpers/embeds/embed-reply");
const {
  checkIfNotInGuild,
  checkAdminPermissions,
} = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "config-goodbye";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(
      "Sets a goodbye message that will be displayed for the members who've left the server."
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Configure or disable the goodbye feature?")
        .addChoices(
          { name: "configure", value: "configure" },
          { name: "disable", value: "disable" }
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("A channel where the goodbye message will be displayed.")
        .addChannelTypes(0) //= GUILD_TEXT aka. text channels
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        //the description length is limited to 100 characters ¯\_(ツ)_/¯
        .setDescription("A message that the new members will see.") //You can use the following placeholders: {user} - the new member's username, {server} - the server's name, {memberCount} - the server's member count.
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("embed")
        .setDescription(
          "Whether the message should be sent as an embed (doesn't supports pinging users)."
        )
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("embed-color")
        .setDescription("The HEX color of the embed message. Leave empty for default color.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(interaction) {
    let title;
    let description;

    const action = interaction.options.getString("action");

    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const permissionCheck = checkAdminPermissions(commandName, interaction);
    if (permissionCheck) {
      return await replyAndLog(interaction, permissionCheck);
    }

    if (action === "configure") {
      try {
        const channelId = interaction.options.getChannel("channel").id;
        const goodbyeMessage = interaction.options.getString("message");
        const isEmbed = interaction.options.getBoolean("embed") || 0;
        const embedColor = interaction.options.getInteger("embed-color") || null;

        const guildId = interaction.guild.id;
        const adderId = interaction.user.id;
        const adderUsername = interaction.user.username;

        const query = await db.query(
          "SELECT channelId, message, isEmbed, embedColor FROM configGoodbye WHERE guildId = ?",
          [guildId]
        );
        const existingChannelId = query[0]?.channelId || null;
        const existingGoodbyeMessage = query[0]?.message || null;
        const existingIsEmbed = query[0]?.isEmbed || 0;
        const existingEmbedColor = query[0]?.embedColor || null;

        await db.query(
          "INSERT INTO configGoodbye (guildId, channelId, message, isEmbed, embedColor, adderId, adderUsername) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE channelId = ?, message = ?, adderId = ?, adderUsername = ?, isEmbed = ?, embedColor = ?",
          [
            guildId,
            channelId,
            goodbyeMessage,
            isEmbed,
            embedColor,
            adderId,
            adderUsername,
            channelId,
            goodbyeMessage,
            adderId,
            adderUsername,
            isEmbed,
            embedColor,
          ]
        );

        //if goodbye messages haven't been configured for the current server
        if (!existingChannelId) {
          title = "Goodbye Configure: Configuration Set";
          description =
            "The **goodbye message** has been successfully **set**. :white_check_mark:\nRun this command again later if you want to modify or disable the current configuration.";
          return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
        }

        //checks if anything has been modified in the the command
        let modifications = [];
        if (goodbyeMessage != existingGoodbyeMessage) {
          modifications.push("**goodbye message**");
        }
        if (isEmbed != existingIsEmbed) {
          modifications.push("**embed option**");
        }
        if (embedColor != existingEmbedColor) {
          modifications.push("**embed color**");
        }
        if (channelId != existingChannelId) {
          modifications.push(`**goodbye channel** to <#${channelId}>`);
        }

        //if the exact same goodbye configuration is set for the current server (aka. nothing got modified)
        if (modifications.length === 0) {
          title = "Goodbye Configure: Warning";
          description =
            "The exact same goodbye configuration has been set for this server already. :x:\nRun the command again with different options to overwrite or disable the current configuration.";
          return replyAndLog(interaction, embedReplyWarningColor(title, description, interaction));
        }

        let modificationsMessage;
        if (modifications.length === 1) {
          modificationsMessage = modifications[0];
        } else {
          modificationsMessage =
            modifications.slice(0, -1).join(", ") +
            " and " +
            modifications[modifications.length - 1];
        }

        title = "Goodbye Configure: Configuration Modified";
        description = `Successfully modified ${modificationsMessage}. :white_check_mark:\nRun the command again with different options to overwrite or disable the current configuration.`;
        return replyAndLog(
          interaction,
          embedReplySuccessSecondaryColor(title, description, interaction)
        );
      } catch (error) {
        console.error(`Error while running ${commandName}: ${error}`);

        title = "Goodbye Configure: Error";
        description =
          "There was an error while trying to configure the goodbye messages.\nPlease try again later.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }
    }

    if (action === "disable") {
      try {
        const currentGuildId = interaction.guild.id;
        const query = await db.query("SELECT guildId FROM configGoodbye WHERE guildId = ?", [
          currentGuildId,
        ]);
        const goodbyeGuildId = query[0]?.guildId || null;

        if (goodbyeGuildId) {
          await db.query("DELETE FROM configGoodbye WHERE guildId = ?", [goodbyeGuildId]);

          title = "Goodbye Disable: Success";
          description = "The goodbye messages have been disabled successfully for this server.";
          return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
        }

        title = "Goodbye Disable: Warning";
        description =
          "Goodbye messages have not been configured for this server.\nTherefore, you can't disable them.";
        return replyAndLog(interaction, embedReplyWarningColor(title, description, interaction));
      } catch (error) {
        console.error(`Error while running ${commandName}: ${error}`);

        title = "Goodbye Disable: Error";
        description = "There was an error while trying to disable the goodbye messages.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }
    }
  },
};
