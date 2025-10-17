import { capitalizeFirstLetter } from "../format.js";
import { embedReplyFailureColor } from "../embeds/embed-reply.js";
import { query } from "../db.js";
import config from "../../../config.json" with { type: "json" };
const { economyCooldown } = config;

const getUserAndCommandData = async (commandName, interaction) => {
  const commandNameCapitalized = capitalizeFirstLetter(commandName);
  const configuredCooldown = economyCooldown[commandName];
  const queryColumnName = "last" + commandNameCapitalized + "Time";

  const result = await query(`SELECT balance, ${queryColumnName} FROM economy WHERE userId = ?`, [
    interaction.user.id,
  ]);
  const lastUsageTime = result[0]?.[queryColumnName] || null;
  const userBalance = result[0]?.balance;
  const nextApprovedUsageTime = new Date(
    new Date().getTime() + new Date().getTimezoneOffset() * 60000 - configuredCooldown * 60000
  );

  return {
    lastUsageTime,
    nextApprovedUsageTime,
    userBalance,
    commandNameCapitalized,
    configuredCooldown,
  };
};

export const checkCooldown = async (commandName, interaction) => {
  const { lastUsageTime, nextApprovedUsageTime, commandNameCapitalized, configuredCooldown } =
    await getUserAndCommandData(commandName, interaction);

  if (lastUsageTime >= nextApprovedUsageTime) {
    const remainingTimeInSeconds = Math.ceil(
      (lastUsageTime.getTime() - nextApprovedUsageTime.getTime()) / 1000
    );
    const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
    const remainingSeconds = remainingTimeInSeconds % 60;

    var embedReply = embedReplyFailureColor(
      `${commandNameCapitalized} - Cooldown`,
      `You've already used the \`/${commandName}\` command in the last ${configuredCooldown} ${configuredCooldown === 1 ? "minute" : "minutes"}.\nPlease wait **${remainingMinutes} minute${remainingMinutes <= 1 ? "" : "s"}** and **${remainingSeconds} second${remainingSeconds <= 1 ? "" : "s"}** before using this command again.`,
      interaction
    );

    return embedReply;
  } else {
    return null;
  }
};

export const getRemainingCooldown = async (commandName, timeColumnName, userId) => {
  const configuredCooldown = economyCooldown[commandName];

  const result = await query(`SELECT ${timeColumnName} FROM economy WHERE userId = ?`, [userId]);
  const lastUsageTime = result[0]?.[timeColumnName] || null;
  const nextApprovedUsageTime = new Date(
    new Date().getTime() + new Date().getTimezoneOffset() * 60000 - configuredCooldown * 60000
  );

  if (lastUsageTime >= nextApprovedUsageTime) {
    const remainingTimeInSeconds = Math.ceil(
      (lastUsageTime.getTime() - nextApprovedUsageTime.getTime()) / 1000
    );

    const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
    const remainingSeconds = remainingTimeInSeconds % 60;

    return `You can use \`/${commandName}\` in **${remainingMinutes} minute${remainingMinutes <= 1 ? "" : "s"}** and **${remainingSeconds} second${remainingSeconds <= 1 ? "" : "s"}**`;
  }

  return `You can use \`/${commandName}\` now.`;
};

export const checkBalanceAndBetAmount = async (commandName, interaction, amount) => {
  const { commandNameCapitalized, userBalance } = await getUserAndCommandData(
    commandName,
    interaction
  );

  if (userBalance < amount) {
    var embedReply = embedReplyFailureColor(
      `${commandNameCapitalized} - Insufficient balance`,
      `You can't use the \`/${commandName}\` command with that much money!\nYour current balance is only \`$${userBalance}\`.`,
      interaction
    );

    return embedReply;
  }

  if (amount <= 0) {
    var embedReply = embedReplyFailureColor(
      `${commandNameCapitalized} - Invalid amount`,
      `You can't use the \`/${commandName}\` command without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.`,
      interaction
    );

    return embedReply;
  }

  return null;
};
