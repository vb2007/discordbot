import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { getRemainingCooldown } from "../../helpers/command-validation/economy.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";

const commandName = "cooldown";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Display the remaining cooldowns for all economy commands.")
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const interactionUserId = interaction.user.id;

    const remainingTimes = [
      {
        name: "/work",
        value: await getRemainingCooldown("work", "lastWorkTime", interactionUserId),
        inline: true,
      },
      {
        name: "/beg",
        value: await getRemainingCooldown("beg", "lastBegTime", interactionUserId),
        inline: true,
      },
      {
        name: "/rob",
        value: await getRemainingCooldown("rob", "lastRobTime", interactionUserId),
        inline: true,
      },
      {
        name: "/roulette",
        value: await getRemainingCooldown("roulette", "lastRouletteTime", interactionUserId),
        inline: true,
      },
      {
        name: "/blackjack",
        value: await getRemainingCooldown("blackjack", "lastBlackjackTime", interactionUserId),
        inline: true,
      },
      {
        name: "/coinflip",
        value: await getRemainingCooldown("coinflip", "lastCoinflipTime", interactionUserId),
        inline: true,
      },
    ];

    const embedReply = embedReplyPrimaryColorWithFields(
      "Economy cooldowns",
      "Various economy commands and the next time you will be able to use them.",
      remainingTimes,
      interaction
    );

    return replyAndLog(interaction, embedReply);
  },
};
