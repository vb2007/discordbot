import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import {
  embedReplySuccessColor,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription(
      "Purges (mass deletes) a specified amount of messages from the current channel."
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages the bot will purge.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  async execute(interaction) {
    const messageAmount = interaction.options.get("amount").value;

    if (!interaction.inGuild()) {
      var embedReply = embedReplyFailureColor(
        "Purge - Error",
        "You can only purge messages in a server.",
        interaction
      );
    } else if (messageAmount > 100) {
      var embedReply = embedReplyFailureColor(
        "Purge - Error",
        "Cannot delete more than 100 messages at once due to Discord's limitations.\nPlease try again with a lower amount.\nRun the command multiple times if needed.",
        interaction
      );
    } else {
      try {
        await interaction.channel.bulkDelete(messageAmount);
        var embedReply = embedReplySuccessColor(
          "Purge - Success",
          `Deleted ${messageAmount} messages successfully.`,
          interaction
        );
      } catch (error) {
        console.error(error);
        var embedReply = embedReplyFailureColor(
          "Purge - Error",
          "There was an error trying to purge the messages.",
          interaction
        );
      }
    }

    const deleteButton = new ButtonBuilder()
      .setCustomId("delete")
      .setLabel("Delete message")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(deleteButton);

    await interaction.reply({
      embeds: [embedReply],
      components: [row],
    });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));

    const filter = (i) => i.customId === "delete" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      await i.deleteReply();
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply({ components: [] });
      }
    });
  },
};
