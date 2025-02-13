const { economyCooldown } = require("../../config.json");
const { capitalizeFirstLetter } = require("./format");
const { embedReplyFailureColor } = require("./embeds/embed-reply");
const db = require("./db");

async function checkCooldown(commandName, interaction) {
    const commnandNameCapitalized = capitalizeFirstLetter(commandName);
    const configuredCooldown = economyCooldown.commandName;
    const queryColumnName = "last" + commnandNameCapitalized + "time";

    const query = await db.query(`SELECT userId, ${queryColumnName} FROM economy WHERE userId = ?`, [interaction.user.id]);
    const lastUsageTime = query[0]?.queryColumnName || null;
    const nextApprovedUsageTime = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - configuredCooldown * 60000);

    if(lastUsageTime >= nextApprovedUsageTime) {
        const remainingTimeInSeconds = Math.ceil((lastUsageTime.getTime() - nextApprovedUsageTime.getTime()) / 1000);
        const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
        const remainingSeconds = remainingTimeInSeconds % 60;

        var embedReply = embedReplyFailureColor(
            `${commnandNameCapitalized} - Error`,
            `You've already used the \`/${commandName}\` command in the last ${configuredCooldown} minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to use this again.`,
            interaction
        );

        return embedReply;
    }
    else {
        return;
    }
}

module.exports = checkCooldown;