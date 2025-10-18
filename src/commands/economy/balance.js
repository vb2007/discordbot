import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColor } from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "balance";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Displays a user's balance.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Choose who's balance you'd like to see.")
        .setRequired(false)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const interactionUserId = interaction.user.id;
    const targetUserId = interaction.options.getUser("user")?.id || interactionUserId;
    const result = await query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [
      targetUserId,
    ]);
    const balance = result[0]?.balance || 0;
    const balanceInBank = result[0]?.balanceInBank || 0;

    let description;
    if (balance === 0 && balanceInBank === 0) {
      description =
        targetUserId === interactionUserId
          ? `You (<@${interactionUserId}>) have no money in your wallet. :moneybag:\nAnd you have no money in your bank. :bank:`
          : `<@${targetUserId}> has no money in their wallet. :moneybag:\nAnd they have no money in their bank. :bank:`;
    } else if (balance === 0) {
      description =
        targetUserId === interactionUserId
          ? `You (<@${interactionUserId}>) have no money in your wallet. :moneybag:\nAnd your bank balance is \`$${balanceInBank}\`. :bank:`
          : `<@${targetUserId}> has no money in their wallet. :moneybag:\nAnd their bank balance is \`$${balanceInBank}\`. :bank:`;
    } else if (balanceInBank === 0) {
      description =
        targetUserId === interactionUserId
          ? `Your (<@${interactionUserId}>) balance is \`$${balance}\`. :moneybag:\nAnd you have no money in your bank. :bank:`
          : `<@${targetUserId}>'s balance is \`$${balance}\`. :moneybag:\nAnd they have no money in their bank. :bank:`;
    } else {
      description =
        targetUserId === interactionUserId
          ? `Your (<@${interactionUserId}>) balance is \`$${balance}\`. :moneybag:\nAnd your bank balance is \`$${balanceInBank}\`. :bank:`
          : `<@${targetUserId}>'s balance is \`$${balance}\`. :moneybag:\nTheir bank balance is \`$${balanceInBank}\`. :bank:`;
    }

    const embedReply = embedReplyPrimaryColor("Balance", description, interaction);

    return await replyAndLog(interaction, embedReply);
  },
};
