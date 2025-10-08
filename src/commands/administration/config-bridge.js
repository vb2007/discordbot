const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {
  embedReplySuccessColor,
  embedReplyFailureColor,
  embedReplySuccessSecondaryColor,
} = require("../../helpers/embeds/embed-reply");
const {
  checkIfNotInGuild,
  checkAdminPermissions,
} = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "config-bridge";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(
      "Sets up bridging between a source channel on another server and a destination channel."
    ) //...on the current one. [discord character limit]
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Configure or disable the bridging feature?")
        .addChoices(
          { name: "configure", value: "configure" },
          { name: "disable", value: "disable" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("source-channel-id")
        .setDescription("The ID of the source channel on another server.")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("destination-channel")
        .setDescription("A channel where the bot will send the bridged messages.")
        .addChannelTypes(0)
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
        const sourceChannelId = interaction.options.getString("source-channel-id");
        const destinationChannel = interaction.options.getChannel("destination-channel");

        const guildId = interaction.guild.id;
        const guildName = interaction.guild.name;
        const destinationChannelId = destinationChannel.id;
        const destinationChannelName = destinationChannel.name;
        const interactionUserId = interaction.user.id;
        const interactionUsername = interaction.user.username;

        const query = await db.query(
          "SELECT destinationChannelId, sourceChannelId, destinationGuildId FROM configBridging WHERE sourceChannelId = ? AND destinationChannelId = ?",
          [sourceChannelId, destinationChannelId]
        );
        const destinationGuildId = query[0]?.destinationGuildId || null;
        const existingSourceChannelId = query[0]?.sourceChannelId || null;
        const existingDestinationChannelId = query[0]?.destinationChannelId || null;

        if (
          existingSourceChannelId == sourceChannelId &&
          existingDestinationChannelId == destinationChannelId &&
          destinationGuildId == guildId
        ) {
          title = "Bridge Configure: Error";
          description = `Bridging has already been configured for the channel <#${sourceChannelId}> (\`${sourceChannelId}\`). :x:\n`;
          return await replyAndLog(
            interaction,
            embedReplyFailureColor(title, description, interaction)
          );
        }

        if (existingSourceChannelId == sourceChannelId && destinationGuildId == guildId) {
          await db.query(
            "UPDATE configBridging SET destinationChannelId = ?, destinationChannelName = ?, adderId = ?, adderUsername = ? WHERE sourceChannelId = ? AND destinationChannelId = ?",
            [
              destinationChannelId,
              destinationChannelName,
              interactionUserId,
              interactionUsername,
              sourceChannelId,
              destinationChannelId,
            ]
          );

          title = "Bridge Configure: Configuration Modified";
          description = `The destination channel for <#${sourceChannelId}> (\`${sourceChannelId}\`) has been updated to <#${destinationChannelId}>. :white_check_mark:\nRun this command again to modify the channel.`;
          return await replyAndLog(
            interaction,
            embedReplySuccessSecondaryColor(title, description, interaction)
          );
        }

        if (existingSourceChannelId != sourceChannelId && destinationGuildId == guildId) {
          await db.query(
            "INSERT INTO configBridging (sourceChannelId, destinationGuildId, destinationGuildName, destinationChannelId, destinationChannelName, adderId, adderUsername) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              sourceChannelId,
              guildId,
              guildName,
              destinationChannelId,
              destinationChannelName,
              interactionUserId,
              interactionUsername,
            ]
          );

          title = "Bridge Configure: Success";
          description = `Another channel has been added to bridging successfully. :white_check_mark:\nMessages from <#${sourceChannelId}> (\`${sourceChannelId}\`) will now get bridged to <#${destinationChannelId}>.`;
          return await replyAndLog(
            interaction,
            embedReplySuccessColor(title, description, interaction)
          );
        }

        await db.query(
          "INSERT INTO configBridging (sourceChannelId, destinationGuildId, destinationGuildName, destinationChannelId, destinationChannelName, adderId, adderUsername) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            sourceChannelId,
            guildId,
            guildName,
            destinationChannelId,
            destinationChannelName,
            interactionUserId,
            interactionUsername,
          ]
        );

        title = "Bridge Configure: Success";
        description = `Bridging has been successfully configured. :white_check_mark:\nMessages from <#${sourceChannelId}> (\`${sourceChannelId}\`) will now get bridged to <#${destinationChannelId}>.`;
        return await replyAndLog(
          interaction,
          embedReplySuccessColor(title, description, interaction)
        );
      } catch (error) {
        console.error(`Failed to configure bridging: ${error.message}\n${error.stack}`);

        title = "Bridge Configure: Error";
        description =
          "An error occurred while configuring the bridging feature. :x:\nPlease try again.";
        return await replyAndLog(
          interaction,
          embedReplyFailureColor(title, description, interaction)
        );
      }
    }

    if (action === "disable") {
      try {
        const sourceChannelId = interaction.options.getString("source-channel-id");
        const guildId = interaction.guild.id;

        const query = await db.query(
          "SELECT sourceChannelId, destinationGuildId FROM configBridging WHERE sourceChannelId = ? AND destinationGuildId = ?",
          [sourceChannelId, guildId]
        );
        const existingGuildId = query[0]?.destinationGuildId || null;
        const existingSourceChannelId = query[0]?.sourceChannelId || null;

        if (existingSourceChannelId && existingGuildId) {
          await db.query(
            "DELETE FROM configBridging WHERE sourceChannelId = ? AND destinationGuildId = ?",
            [sourceChannelId, guildId]
          );

          title = "Bridge Disable: Success";
          description = `Bridging has been disabled for the channel <#${sourceChannelId}> (\`${sourceChannelId}\`). :white_check_mark:`;
          return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
        }

        title = "Bridge Disable: Error";
        description = `Bridging has not been configured for the channel <#${sourceChannelId}> (\`${sourceChannelId}\`). :x:\nTherefore, you can't disable it.`;
        return await replyAndLog(
          interaction,
          embedReplyFailureColor(title, description, interaction)
        );
      } catch (error) {
        console.error(`Error while disabling bridging: ${error}`);

        title = "Bridge Disable: Error";
        description =
          "An error occurred while disabling the bridging feature. :x:\nPlease try again.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }
    }
  },
};
