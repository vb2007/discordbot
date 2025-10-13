import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplySuccessSecondaryColor,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import {
  checkIfNotInGuild,
  checkAdminPermissions,
} from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "config-logging";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Sets up logging with various options for the current server.")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Configure or disable the logging feature?")
        .addChoices(
          { name: "configure", value: "configure" },
          { name: "disable", value: "disable" }
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("target-channel")
        .setDescription("A channel where the bot will send the logged data.")
        .addChannelTypes(0) //= text channels
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
        const targetChannel = interaction.options.getChannel("target-channel");
        const interactionUserId = interaction.user.id;
        const interactionUsername = interaction.user.username;
        const targetChannelId = targetChannel.id;
        const targetChannelName = targetChannel.name;
        const guildId = interaction.guild.id;

        const result = await query(
          "SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?",
          [guildId]
        );
        const existingGuildId = result[0]?.guildId || null;
        const existingLogChannelId = result[0]?.logChannelId || null;

        if (existingLogChannelId == targetChannelId) {
          title = "Logging Configure: Error";
          description = `Logging has already been configured for this server for the channel <#${targetChannelId}>. :x:\nRun the command with another channel to overwrite the current one.`;
          return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
        }

        if (existingGuildId == guildId) {
          await query(
            "UPDATE configLogging SET logChannelId = ?, logChannelName = ?, lastModifierId = ?, lastModifierName = ? WHERE guildId = ?",
            [targetChannelId, targetChannelName, interactionUserId, interactionUsername, guildId]
          );

          title = "Logging Configure: Configuration Modified";
          description = `The logging channel has been updated to <#${targetChannelId}>. :white_check_mark:\nRun this command again to modify the channel or disable this feature.`;
          return replyAndLog(
            interaction,
            embedReplySuccessSecondaryColor(title, description, interaction)
          );
        }

        await query(
          "INSERT INTO configLogging (guildId, logChannelId, logChannelName, firstConfigurerId, firstConfigurerName) VALUES (?, ?, ?, ?, ?)",
          [guildId, targetChannelId, targetChannelName, interactionUserId, interactionUsername]
        );

        title = "Logging Configure: Configuration Set";
        description = `Logging has been set up for this server in <#${targetChannelId}>. :white_check_mark:\nRun this command again to modify the channel or disable this feature.`;
        return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
      } catch (error) {
        console.error(`Error while running ${commandName}: ${error}`);

        title = "Config Logging: Error";
        description = "There was an error while trying to set up logging.\nPlease try again later.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }
    }

    if (action === "disable") {
      try {
        const currentGuildId = interaction.guild.id;
        const result = await query("SELECT guildId FROM configLogging WHERE guildId = ?", [
          currentGuildId,
        ]);
        const existingGuildId = result[0]?.guildId || null;

        if (existingGuildId) {
          await query("DELETE FROM configLogging WHERE guildId = ?", [currentGuildId]);

          title = "Logging Disable: Success";
          description = "The logging feature has been disabled successfully. :white_check_mark:";
          return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
        }

        title = "Logging Disable: Error";
        description =
          "Logging has not been configured for this server. :x:\nTherefore, you can't disable it.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      } catch (error) {
        console.error(`Error while running ${commandName}: ${error}`);

        title = "Logging Disable: Error";
        description =
          "There was an error while trying to disable logging.\nPlease try again later.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }
    }
  },
};
