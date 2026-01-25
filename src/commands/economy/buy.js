import { SlashCommandBuilder } from "discord.js";
import {
    embedReplySuccessColor,
    embedReplyFailureColor,
    embedReplyWarningColor,
} from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "buy";

export default {
    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Let's you buy a specified item.")
        .addStringOption((option) =>
            option
                .setName("item-name")
                .setDescription("The item's exact name you would like to buy.")
                .setMinLength(2)
                .setMaxLength(10)
                .setRequired(true)
        )
        .setNSFW(false)
        .setDMPermission(false),
    async execute(interaction) {
        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        const itemName = interaction.options.getString("item-name");
        const interactionUserId = interaction.user.id;

        const [item] = await query("SELECT id, price, name FROM economyStore WHERE name = ?", [
            itemName,
        ]);

        if (!item) {
            const embed = embedReplyWarningColor(
                "Buy: Invalid Item",
                `\`${itemName}\` isn't a valid item.\nUse the \`/store\` command to see all purchaseable items.`,
                interaction
            );
            return await replyAndLog(interaction, embed);
        }

        const [userBalance] = await query("SELECT balance FROM economy WHERE userId = ?", [
            interactionUserId,
        ]);

        if (!userBalance || userBalance.balance < item.price) {
            const embed = embedReplyWarningColor(
                "Buy: Insufficient Funds",
                `You don't have enough money to buy \`${item.name}\`. Price: \`$${item.price}\`.`,
                interaction
            );

            return await replyAndLog(interaction, embed);
        }

        try {
            await query("UPDATE economy SET balance = balance - ? WHERE userId = ?", [
                item.price,
                interactionUserId,
            ]);

            await query(
                `INSERT INTO economyInventory (userId, itemId, quantity)
                    VALUES (?, ?, 1)
                    ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
                [interactionUserId, item.id]
            );

            const embedReply = embedReplySuccessColor(
                "Buy: Successful",
                `You've successfully bought \`${item.name}\` for \`$${item.price}\`!`,
                interaction
            );

            return await replyAndLog(interaction, embedReply);
        } catch (error) {
            const embedReply = embedReplyFailureColor(
                "Buy: Error",
                "An error occurred while processing the purchase.",
                interaction
            );

            return await replyAndLog(interaction, embedReply);
        }
    },
};
