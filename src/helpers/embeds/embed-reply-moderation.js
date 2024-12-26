const { EmbedBuilder } = require("discord.js");
const { embedColors } = require("../../../config.json");

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function moderationDmEmbedReplyFailureColor(title, description, interaction) {
    const embedDmReply = new EmbedBuilder({
        color: parseInt(embedColors.failure),
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Moderator: ${interaction.user.username}` ,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
    });

    return embedDmReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function moderationDmEmbedReplyWarningColor(title, description, interaction) {
    const embedDmReply = new EmbedBuilder({
        color: parseInt(embedColors.warning),
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Moderator: ${interaction.user.username}` ,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
        },
    });

    return embedDmReply;
}

module.exports = {
    moderationDmEmbedReplyFailureColor,
    moderationDmEmbedReplyWarningColor,
}