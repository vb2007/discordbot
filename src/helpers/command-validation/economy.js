const { economyCooldown } = require("../../../config.json");
const { capitalizeFirstLetter } = require("../format");
const { embedReplyFailureColor } = require("../embeds/embed-reply");
const db = require("../db");

async function getUserAndCommandData(commandName, interaction) {
    const commandNameCapitalized = capitalizeFirstLetter(commandName);
    const configuredCooldown = economyCooldown[commandName];
    const queryColumnName = "last" + commandNameCapitalized + "Time";

    const query = await db.query(`SELECT balance, ${queryColumnName} FROM economy WHERE userId = ?`, [interaction.user.id]);
    const lastUsageTime = query[0]?.[queryColumnName] || null;
    const userBalance = query[0]?.balance;
    const nextApprovedUsageTime = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - configuredCooldown * 60000);

    return {
        lastUsageTime,
        nextApprovedUsageTime,
        userBalance,
        commandNameCapitalized,
        configuredCooldown
    };
}

async function checkCooldown(commandName, interaction) {
    const {
        lastUsageTime,
        nextApprovedUsageTime,
        commandNameCapitalized,
        configuredCooldown
    } = await getUserAndCommandData(commandName, interaction);

    if(lastUsageTime >= nextApprovedUsageTime) {
        const remainingTimeInSeconds = Math.ceil((lastUsageTime.getTime() - nextApprovedUsageTime.getTime()) / 1000);
        const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
        const remainingSeconds = remainingTimeInSeconds % 60;

        var embedReply = embedReplyFailureColor(
            `${commandNameCapitalized} - Cooldown`,
            `You've already used the \`/${commandName}\` command in the last ${configuredCooldown} ${configuredCooldown === 1 ? 'minute' : 'minutes'}.\nPlease wait **${remainingMinutes} minute${remainingMinutes <= 1 ? '' : 's'}** and **${remainingSeconds} second${remainingSeconds <= 1 ? '' : 's'}** before using this command again.`,
            interaction
        );

        return embedReply;
    }
    else {
        return null;
    }
}

async function checkBalanceAndBetAmount(commandName, interaction, amount) {
    const {
        commandNameCapitalized,
        userBalance
    } = await getUserAndCommandData(commandName, interaction);

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
}

module.exports = { checkCooldown, checkBalanceAndBetAmount };