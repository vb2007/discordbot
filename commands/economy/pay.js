const { EmbedBuilder, SlashCommandBuilder, Embed } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pay")
        .setDescription("Pay someone a specified amount of money.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("The user who will receive the payment.")
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money the target user will receive.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild) {
            var replyContent = "You can only pay out a member in a server.";
        }
        else {
            const amount = interaction.options.getInteger("amount");
            const targetUserId = interaction.options.getUser("target").id;
            const interactionUserId = interaction.user.id;

            const interactionUserBalanceQuery = await db.query("SELECT balance FROM economy WHERE userId = ?", [interactionUserId]);
            const userBalance = interactionUserBalanceQuery[0]?.balance || null;

            const targetUserBalanceQuery = await db.query("SELECT balance FROM economy WHERE userId = ?", [targetUserId]);
            const targetUserBalance = targetUserBalanceQuery[0]?.balance || null;

            if (amount > userBalance) {
                var replyContent = `:x: You can't pay that much money to <@${targetUserId}>!\nYour balance is only \`$${userBalance}\`.`;
            }
            else if (amount <= 0) {
                var replyContent = `:x: You can't pay a negative or zero amount of money to <@${targetUserId}>!\nTry again with a positive amount.`;
            }
            else {
                await db.query("UPDATE economy SET balance = balance - ? WHERE userId = ?",
                    [
                        amount,
                        interactionUserId
                    ]
                );

                if (!targetUserBalance) {
                    await db.query("INSERT INTO economy (userId, balance) VALUES (?, ?)",
                        [
                            targetUserId,
                            amount
                        ]
                    );
                }
                else {
                    await db.query("UPDATE economy SET balance = balance + ? WHERE userId = ?",
                        [
                            amount,
                            targetUserId
                        ]
                    );
                }

                var replyContent = `:white_check_mark: <@${interactionUserId}> has successfully paid \`$${amount}\` to <@${targetUserId}>.`;
            }
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Paying to a member.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}