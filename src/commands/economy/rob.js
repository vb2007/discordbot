const { SlashCommandBuilder } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const { checkCooldown } = require("../../helpers/command-validation/economy");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "rob";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Tries to rob a random amount of money from a specified user.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Choose the target you want to rob from.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        const targetUserId = interaction.options.getUser("target").id;

        if (targetUserId == interaction.user.id) {
            var embedReply = embedReplyFailureColor(
                "Robbing - Friendly fire",
                "Why are you trying to rob from yourself? :clown:\n**TIP:** If you're having trouble finding a target, try using the \`/leaderboard\` command.",
                interaction
            );

            return await replyAndLog(interaction, embedReply);
        }

        const cooldownCheck = await checkCooldown(commandName, interaction);
        if (cooldownCheck) {
            return await replyAndLog(interaction, cooldownCheck);
        }

        const query = await db.query("SELECT balance FROM economy WHERE userId = ?", [targetUserId]);
        const targetUserBalance = query[0]?.balance || null;

        //if target user's balance is below 50...
        if (targetUserBalance < 50) {
            var embedReply = embedReplyFailureColor(
                "Robbing - Error",
                `Your target (<@${targetUserId}>) must have a minimum of \`$50\`.\nPlease choose another target.\n**TIP:** You can check how much money the top memebers have with the \`/leaderboard\` command.`,
                interaction
            );

            return await replyAndLog(interaction, embedReply);
        }

        const robAmount = Math.floor(Math.random() * 50);

        //removes the robbed amount from the target user
        await db.query("UPDATE economy SET balance = balance - ? WHERE userId = ?",
            [
                robAmount,
                targetUserId
            ]
        );

        if(userId) {
            //adds the robbed amount to the interaction's executor
            await db.query("UPDATE economy SET balance = balance + ?, lastRobTime = ? WHERE userId = ?",
                [
                    robAmount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    interaction.user.id
                ]
            );
        }
        //if it's the executor's first time using any economy command (so it's userId is not in the database yet...)
        else {
            await db.query("INSERT INTO economy (userName, userId, balance, firstTransactionDate, lastRobTime) VALUES (?, ?, ?, ?, ?)",
                [
                    interaction.user.username,
                    interaction.user.id,
                    robAmount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    new Date().toISOString().slice(0, 19).replace('T', ' ')
                ]
            );
        }

        var embedReply = embedReplySuccessColor(
            "Robbing successful",
            `<@${interaction.user.id}> has successfully robbed \`$${robAmount}\` from <@${targetUserId}>.`,
            interaction
        );

        return await replyAndLog(interaction, embedReply);
    }
}