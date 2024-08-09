const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.ecports = {
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
        const query = await db.query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [interactionUserId]);
        const balanceInBank = query[0]?.balanceInBank || null;
        const balance = query[0]?.balance || null;

        if (balance < amount) {
            var replyContent = `You can't deposit that much money into your bank account.\nYour current balance is only \`$${balance}\`.`;
        }
        else {
            await db.query("UPDATE economy SET balance = balance - ?, balanceInBank = balanceInBank + ? WHERE userId = ?",
                [
                    amount,
                    amount,
                    interactionUserId
                ]
            )

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