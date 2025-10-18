import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { getRemainingCooldown } from "../../helpers/command-validation/economy.js";
import { capitalizeFirstLetter } from "../../helpers/format.js";
import { replyAndLog } from "../../helpers/reply.js";

const commandName = "cooldown";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Display the remaining cooldowns for a specified / all economy commands.")
    .addStringOption((option) =>
      option
        .setName("command-name")
        .setDescription("Gives you back the remaining time for a specific command.")
        .addChoices(
          { name: "Work", value: "work" },
          { name: "Beg", value: "beg" },
          { name: "Rob", value: "rob" },
          { name: "Roulette", value: "roulette" },
          { name: "Blackjack", value: "blackjack" },
          { name: "Coinflip", value: "coinflip" }
        )
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user whose cooldowns you would like to check.")
        .setRequired(false)
    )
    .setDMPermission(false),
  async execute(interaction) {
    let remainingTimes;

    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const command = interaction.option.getString("command-name") || null;
    const userId = interaction.options.getInteger("user").id || interaction.user.id;

    if (command != null) {
      remainingTimes = [
        {
          name: `/${commandName}`,
          value: await getRemainingCooldown(
            commandName,
            `last${capitalizeFirstLetter(commandName)}Time`
          ),
          inline: false,
        },
      ];
    } else {
      remainingTimes = [
        {
          name: "/work",
          value: await getRemainingCooldown("work", "lastWorkTime", userId),
          inline: true,
        },
        {
          name: "/beg",
          value: await getRemainingCooldown("beg", "lastBegTime", userId),
          inline: true,
        },
        {
          name: "/rob",
          value: await getRemainingCooldown("rob", "lastRobTime", userId),
          inline: true,
        },
        {
          name: "/roulette",
          value: await getRemainingCooldown("roulette", "lastRouletteTime", userId),
          inline: true,
        },
        {
          name: "/blackjack",
          value: await getRemainingCooldown("blackjack", "lastBlackjackTime", userId),
          inline: true,
        },
        {
          name: "/coinflip",
          value: await getRemainingCooldown("coinflip", "lastCoinflipTime", userId),
          inline: true,
        },
      ];
    }

    const embedReply = embedReplyPrimaryColorWithFields(
      "Economy cooldowns",
      `Various economy commands and the next time <@${userId}> will be able to use them.`,
      remainingTimes,
      interaction
    );

    return replyAndLog(interaction, embedReply);
  },
};
