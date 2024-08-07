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
        .addIntegerOption(otpion =>
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
            const targetUser = interaction.option.getUser("target");
            const interactionUserId = interaction.user.id;

            const query = await db.query("SELECT balance FROM economy WHERE userId = ?", []);
            const userBalance = query[0]?.balance || null;

            if (amount < userBalance) {
                var replyContent = `You can't pay that much money to ${targetUser}!\nYour balance is only \`$${userBalance}\`.`;
            }
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Paying to a member.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        interaction.reply({ embeds: embedReply});

        
    }
}