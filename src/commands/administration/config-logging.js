const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {
  embedReplySuccessColor,
  embedReplySuccessSecondaryColor,
  embedReplyFailureColor,
} = require("../../helpers/embeds/embed-reply");
const {
  checkIfNotInGuild,
  checkAdminPermissions,
} = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "config-logging";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(
      "Sets up logging with various options for the current server.",
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Configure or disable the logging feature?")
        .addChoices(
          { name: "configure", value: "configure" },
          { name: "disable", value: "disable" },
        )
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("target-channel")
        .setDescription("A channel where the bot will send the logged data.")
        .addChannelTypes(0) //= text channels
        .setRequired(false),
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

        const query = await db.query(
          "SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?",
          [guildId],
        );
        const existingGuildId = query[0]?.guildId || null;
        const existingLogChannelId = query[0]?.logChannelId || null;

        if (existingLogChannelId == targetChannelId) {
          title = "Logging Configure: Error";
          description = `Logging has already been configured for this server for the channel <#${targetChannelId}>. :x:\nRun the command with another channel to overwrite the current one.`;
          return replyAndLog(
            interaction,
            embedReplyFailureColor(title, description, interaction),
          );
        }

        if (existingGuildId == guildId) {
          await db.query(
            "UPDATE configLogging SET logChannelId = ?, logChannelName = ?, lastModifierId = ?, lastModifierName = ? WHERE guildId = ?",
            [
              targetChannelId,
              targetChannelName,
              interactionUserId,
              interactionUsername,
              guildId,
            ],
          );

          title = "Logging Configure: Configuration Modified";
          description = `The logging channel has been updated to <#${targetChannelId}>. :white_check_mark:\nRun this command again to modify the channel or disable this feature.`;
          return replyAndLog(
            interaction,
            embedReplySuccessSecondaryColor(title, description, interaction),
          );
        }

        await db.query(
          "INSERT INTO configLogging (guildId, logChannelId, logChannelName, firstConfigurerId, firstConfigurerName) VALUES (?, ?, ?, ?, ?)",
          [
            guildId,
            targetChannelId,
            targetChannelName,
            interactionUserId,
            interactionUsername,
          ],
        );

        title = "Logging Configure: Configuration Set";
        description = `Logging has been set up for this server in <#${targetChannelId}>. :white_check_mark:\nRun this command again to modify the channel or disable this feature.`;
        return replyAndLog(
          interaction,
          embedReplySuccessColor(title, description, interaction),
        );
      } catch (error) {
        console.error(`Error while running ${commandName}: ${error}`);

        title = "Config Logging: Error";
        description =
          "There was an error while trying to set up logging.\nPlease try again later.";
        return replyAndLog(
          interaction,
          embedReplyFailureColor(title, description, interaction),
        );
      }
    }

    if (action === "disable") {
    }
  },
};
