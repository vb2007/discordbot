const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor, embedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const { logToFileAndDatabase } = require("../../helpers/logger");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

//should be configureable in the future with the config.json file
const dailyDepositLimit = 10;
const feePercentage = 0.3;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Deposits a specified amount of money to your bank account.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you want to deposit.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        let isCommandReplied = false;

        const amount = interaction.options.getInteger("amount");
        const interactionUserId = interaction.user.id;
        const query = await db.query("SELECT balance, balanceInBank, dailyDeposits, lastDepositTime FROM economy WHERE userId = ?", [interactionUserId]);
        const balanceInBank = Number(query[0]?.balanceInBank) || 0;
        const balance = Number(query[0]?.balance) || 0;
        let dailyDeposits = Number(query[0]?.dailyDeposits) || 0;
        const lastDepositTime = query[0]?.lastDepositTime;
        const now = new Date();

        //resets daily deposits if the last deposit was not today
        if (lastDepositTime && lastDepositTime.toDateString() !== now.toDateString()) {
            dailyDeposits = 0;
            await db.query("UPDATE economy SET dailyDeposits = 0 WHERE userId = ?", [interactionUserId]);
        }
        
        const balanceCheck = await checkBalanceAndBetAmount(commandName, interaction, amount);
        if (balanceCheck) {
            return await replyAndLog(interaction, balanceCheck);
        }

        if (dailyDeposits >= dailyDepositLimit) {
            const fee = amount * feePercentage;
            const totalAmount = amount + fee;

            if (balance < totalAmount) {
                var embedReply = embedReplyFailureColor(
                    "Deposit - Fee",
                    `You can't deposit that much money into your bank account.\nYou've reached your daily free deposit limit, and your balance is \`$${balance}\`,\so you currently can't pay the deposit fee: \`$${fee}\`.\n`,
                    interaction
                );

                return await replyAndLog(interaction, embedReply);
            }

            const embedReply = embedReplyWarningColor(
                "Deposit - Fee",
                `You've reached your daily free deposit limit, but you can still deposit money for a fee of \`$${fee}\`.\nDo you want to deposit the money?`,
                interaction
            );
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("confirm")
                        .setLabel("Confirm")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("cancel")
                        .setLabel("Cancel")
                        .setStyle(ButtonStyle.Danger)
            );
            
            const message = await interaction.reply({embeds: [embedReply], components: [row], fetchReply: true});
            isCommandReplied = true;

            const filter = i => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 15000 });

            collector.on("collect", async i => {
                if (i.customId === "confirm") {
                    await db.query("UPDATE economy SET balance = balance - ?, balanceInBank = balanceInBank + ?, dailyDeposits = dailyDeposits + 1, lastDepositTime = ? WHERE userId = ?",
                        [
                            totalAmount,
                            amount,
                            now,
                            interactionUserId
                        ]
                    );

                    var embedReply = embedReplySuccessColor(
                        "Deposit - Successful",
                        `You've successfully deposited \`$${amount}\` for a fee of \`$${fee}\`.\nYour balance decreased by total of \`$${totalAmount}\`.`,
                        interaction
                    );

                    await i.update({ embeds: [embedReply], components: [] });
                    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
                }
                else if (i.customId === "cancel") {
                    var embedReply = embedReplyFailureColor(
                        "Deposit - Cancelled",
                        `You've cancelled the deposit of \`$${amount}\`.`,
                        interaction
                    );

                    await i.update({ embeds: [embedReply], components: [] });
                }
            });

            collector.on("end", collected => {
                if (collected.size === 0) {
                    var embedReply = embedReplyFailureColor(
                        "Deposit cancelled",
                        "No response received. Deposit canceled.",
                        interaction
                    );

                    interaction.editReply({ embeds: [embedReply], components: [] });
                }
            })
        }
        else {
            await db.query("UPDATE economy SET balance = balance - ?, balanceInBank = balanceInBank + ?, dailyDeposits = dailyDeposits + 1, lastDepositTime = ? WHERE userId = ?",
                [
                    amount,
                    amount,
                    now,
                    interactionUserId
                ]
            );

            var embedReply = embedReplySuccessColor(
                "Deposit - Success",
                `You've successfully deposited \`$${amount}\` into your bank account.\nYour current balance is \`$${balance - amount}\`. :moneybag:\nYour current balance in the bank is \`$${balanceInBank + amount}\`. :bank:`,
                interaction
            );
        }

        if (!isCommandReplied) {
            await interaction.reply({ embeds: [embedReply] });
            await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
        }        
    }
}