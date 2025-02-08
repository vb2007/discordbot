const { EmbedBuilder } = require("discord.js");
const { embedColors } = require("../../../config.json");

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
        color: parseInt(embedColors.primary),
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
        color: parseInt(embedColors.success),
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
        color: parseInt(embedColors.successSecondary),
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
        color: parseInt(embedColors.failure),
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
        color: parseInt(embedColors.warning),
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
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {image} image - An image (url) that will show up in the embed
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyImg(color, title, description, image, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(color),
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

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {image} image - An image (url) that will show up in the embed
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyPrimaryColorImg(title, description, image, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.primary),
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

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - A list of arrays
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyPrimaryColorWithFields(title, description, fields, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.primary),
        title: title,
        description: description,
        fields: fields,
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
 * @param {fields} fields - A list of arrays
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplySuccessColorWithFields(title, description, fields, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.success),
        title: title,
        description: description,
        fields: fields,
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
 * @param {fields} fields - A list of arrays
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyWarningColorWithFields(title, description, fields, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.warning),
        title: title,
        description: description,
        fields: fields,
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
 * @param {fields} fields - A list of arrays
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyFailureColorWithFields(title, description, fields, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.error),
        title: title,
        description: description,
        fields: fields,
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
 * @param {fields} fields - A list of arrays
 * @param {thumbnailUrl} thumbnailUrl - A small image that will appear in top right corner
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyPrimaryColorWithFieldsAndThumbnail(title, fields, thumbnailUrl, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.primary),
        title: title,
        fields: fields,
        thumbnail: {
            url: thumbnailUrl,
        },
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
 * @param {fields} fields - A list of arrays
 * @param {author} author - An object with the author's name and icon
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedReply} An embed reply object
 */
function embedReplyPrimaryColorWithFieldsAndAuthor(title, description, fields, author, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.primary),
        title: title,
        description: description,
        fields: fields,
        author: author,
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
function embedReplySaidByPrimaryColor(title, description, interaction) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.primary),
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `${interaction.user.username} made the bot say this.`,
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
    embedReplyImg,
    embedReplyPrimaryColorImg,
    embedReplyPrimaryColorWithFields,
    embedReplySuccessColorWithFields,
    embedReplyWarningColorWithFields,
    embedReplyFailureColorWithFields,
    embedReplyPrimaryColorWithFieldsAndThumbnail,
    embedReplyPrimaryColorWithFieldsAndAuthor,
    embedReplySaidByPrimaryColor,
}