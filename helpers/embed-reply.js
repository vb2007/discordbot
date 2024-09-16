const { EmbedBuilder } = require("discord.js");
const { embedColors } = require("../config.json");

/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReply(color, title, description, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(color),
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Requested by: ${interaction.user.username}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        }
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyPrimaryColor(title, description, interaction) {
    const embedReply = new EmbedBuilder({
        color: embedColors.primary,
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Requested by: ${interaction.user.username}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        }
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplySuccessColor(title, description, interaction) {
    const embedReply = new EmbedBuilder({
        color: embedColors.success,
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Requested by: ${interaction.user.username}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        }
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplySuccessSecondaryColor(title, description, interaction) {
    const embedReply = new EmbedBuilder({
        color: embedColors.successSecondary,
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Requested by: ${interaction.user.username}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        }
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyFailureColor(title, description, interaction) {
    const embedReply = new EmbedBuilder({
        color: embedColors.failure,
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Requested by: ${interaction.user.username}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        }
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyWarningColor(title, description, interaction) {
    const embedReply = new EmbedBuilder({
        color: embedColors.warning,
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `Requested by: ${interaction.user.username}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        }
    });

    return embedReply;
}

function moderationDmEmbedReply(color, title, description, interaction) {
    const embedDmReply = new EmbedBuilder({
        color: parseInt(color),
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
 * @param {image} image - An image (url) that will show up in the embed
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyPrimaryColorImg(title, description, image, interaction) {
    const embedReply = new EmbedBuilder({
        color: embedColors.primary,
        title: title,
        description: description,
        image: {
            url: `${image}`
        },
        timestamp: new Date().toISOString(),
        footer: {
            text: `Requested by: ${interaction.user.username}`,
            icon_url: interaction.user.displayAvatarURL({ dynamic: true })
        }
    });

    return embedReply;
}

module.exports = {
    embedReply,
    embedReplyPrimaryColor,
    embedReplySuccessColor,
    embedReplySuccessSecondaryColor,
    embedReplyFailureColor,
    embedReplyWarningColor,
    moderationDmEmbedReply,
    embedReplyPrimaryColorImg
}