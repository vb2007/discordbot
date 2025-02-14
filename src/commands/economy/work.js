const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const { checkCooldown } = require("../../helpers/command-validation/economy");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "work";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Lets you work for a random amount of money.")
        .setDMPermission(false),
    async execute(interaction) {
        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        const cooldownCheck = await checkCooldown(commandName, interaction);
        if (cooldownCheck) {
            return await replyAndLog(interaction, cooldownCheck);
        }

        const query = await db.query("SELECT userId FROM economy WHERE userId = ?", [interaction.user.id]);
        const userId = query[0]?.userId || null;

        const amount = Math.floor(Math.random() * 100);
        if (userId) {
            await db.query("UPDATE economy SET balance = balance + ?, lastWorkTime = ? WHERE userId = ?",
                [
                    amount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    userId
                ]
            );
            
            var embedReply = embedReplySuccessColor(
                "Working",
                `You've worked and succesfully earned \`$${amount}\` dollars.`,
                interaction
            );

            return await replyAndLog(interaction, embedReply);
        }

        //if it's the executor's first time using any economy command (so it's userId is not in the database yet...)
        await db.query("INSERT INTO economy (userName, userId, balance, firstTransactionDate, lastWorkTime) VALUES (?, ?, ?, ?, ?)",
            [
                interaction.user.username,
                interaction.user.id,
                amount,
                new Date().toISOString().slice(0, 19).replace('T', ' '),
                new Date().toISOString().slice(0, 19).replace('T', ' ')
            ]
        );

        var embedReply = embedReplySuccessColor(
            "Working",
            `You've worked and succesfully earned \`$${amount}\` dollars.`,
            interaction
        );

        return await replyAndLog(interaction, embedReply);
    }
}