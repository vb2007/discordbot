const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

//should be configureable in the future with the config.json file
const dailyDepositLimit = 10;
const feePercentage = 0.5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Desposits a specified amount of money to your bank account.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you want to deposit.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
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
        }
        console.log(dailyDeposits);
        if (balance < amount) {
            var replyContent = `You can't deposit that much money into your bank account.\nYour current balance is only \`$${balance}\`.`;
        }
        else if (dailyDeposits >= dailyDepositLimit) {
            const fee = amount * feePercentage;
            const totalAmount = amount + fee;

            if (balance < totalAmount) {
                var replyContent = `You can't deposit that much money into your bank account.\nYour balance is \`$${balance}\`,\nbut you currently can't pay the deposit fee: \`$${fee}\`.`;
            }
            else {
                var embedReply = new EmbedBuilder({
                    color: 0x5F0FD6,
                    title: "Depositing.",
                    description: replyContent,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `Requested by: ${interaction.user.username}`,
                        icon_url: interaction.user.displayAvatarURL({ dynamic: true })
                    }
                });
            }
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

            var replyContent = `You've successfully deposited \`$${amount}\` into your bank account.\nYour current balance is \`$${balance - amount}\`.\nYour current balance in the bank is \`$${balanceInBank + amount}\`.`;
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Depositing.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true })
            }
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}