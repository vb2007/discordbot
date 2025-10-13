import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplySuccessSecondaryColor,
  embedReplyFailureColor,
  embedReplyWarningColor,
} from "../../helpers/embeds/embed-reply.js";
import {
  checkIfNotInGuild,
  checkAdminPermissions,
} from "../../helpers/command-validation/general.js";
import replyAndLog from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "config-darwin";

export default {
  data: new SlashCommandBuilder()
    .setName("config-darwin")
    .setDescription("Sets up automatic video posting from a feed to a channel.")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Configure or disable the Darwin feature?")
        .addChoices(
          { name: "configure", value: "configure" },
          { name: "disable", value: "disable" }
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where videos will be posted.")
        .addChannelTypes(0)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
        const channel = interaction.options.getChannel("channel");

        const guildId = interaction.guild.id;
        const adderId = interaction.user.id;
        const adderUsername = interaction.user.username;
        const channelId = channel.id;
        const channelName = channel.name;

        const result = await query("SELECT * FROM configDarwin WHERE guildId = ?", [guildId]);
        const existingConfig = result[0] || null;

        if (existingConfig) {
          if (channelId !== existingConfig.channelId) {
            await query(
              "UPDATE configDarwin SET channelId = ?, channelName = ?, adderId = ?, adderUsername = ? WHERE guildId = ?",
              [channelId, channelName, adderId, adderUsername, guildId]
            );

            title = "Darwin Configure: Channel Updated";
            description = `Successfully changed Darwin channel to <#${channelId}>. :white_check_mark:\n Videos will get posted there from now on.`;
            return replyAndLog(
              interaction,
              embedReplySuccessSecondaryColor(title, description, interaction)
            );
          }

          title = "Darwin Configure: No Change";
          description = `Darwin is already configured to post videos to <#${channelId}>.\n No changes were made.`;
          return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
        }

        await query(
          "INSERT INTO configDarwin (guildId, channelId, channelName, adderId, adderUsername) VALUES (?, ?, ?, ?, ?)",
          [guildId, channelId, channelName, adderId, adderUsername]
        );

        title = "Darwin Configure: Configuration Set";
        description = `Darwin has been configured successfully! :white_check_mark:\n Videos will be posted to <#${channelId}>.`;
        return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
      } catch (error) {
        console.error(`Error configuring Darwin: ${error}`);

        title = "Darwin Configure: Error";
        description = "An error occurred while configuring Darwin. Please try again.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }
    }

    if (action === "disable") {
      try {
        const guildId = interaction.guild.id;

        const result = await query("SELECT * FROM configDarwin WHERE guildId = ?", [guildId]);
        const existingConfig = result[0] || null;

        if (existingConfig) {
          await query("DELETE FROM configDarwin WHERE guildId = ?", [guildId]);

          title = "Darwin Disable: Success";
          description = "Darwin has been disabled for this server. :white_check_mark:";
          return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
        }

        title = "Darwin Disable: Warning";
        description =
          "Darwin has not been configured for this server yet. :x:\nTherefore, you can't disable it.";
        return replyAndLog(interaction, embedReplyWarningColor(title, description, interaction));
      } catch (error) {
        console.error(`Error disabling Darwin: ${error}`);

        title = "Darwin Disable: Error";
        description = "An error occurred while disabling Darwin. Please try again.";
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }
    }
  },
};
