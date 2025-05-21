const { EmbedBuilder } = require("discord.js");
const { embedColors } = require("../../../config.json");

/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
function embedMessage(color, title, description) {
    const embedReply = new EmbedBuilder({
        color: parseInt(color),
        title: title,
        description: description,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
function embedMessageWithServerIcon(color, title, description, guild) {
    const embedReply = new EmbedBuilder({
        color: parseInt(color),
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        footer: {
            text: `In: ${guild.name}`,
            icon_url: guild.iconURL({ dynamic: true })
        }
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
function embedMessagePrimaryColor(title, description) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.primary),
        title: title,
        description: description,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
function embedMessageSuccessColor(title, description) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.success),
        title: title,
        description: description,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
function embedMessageSuccessSecondaryColor(title, description) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.successSecondary),
        title: title,
        description: description,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
function embedMessageFailureColor(title, description) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.failure),
        title: title,
        description: description,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed message object
 */
function embedMessageWarningColor(title, description) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.warning),
        title: title,
        description: description,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
function embedMessageWithFields(color, title, description, fields) {
    const embedReply = new EmbedBuilder({
        color: parseInt(color),
        title: title,
        description: description,
        fields: fields,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
function embedMessagePrimaryColorWithFields(title, description, fields) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.primary),
        title: title,
        description: description,
        fields: fields,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
function embedMessageSuccessColorWithFields(title, description, fields) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.success),
        title: title,
        description: description,
        fields: fields,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
function embedMessageSuccessSecondaryColorWithFields(title, description, fields) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.successSecondary),
        title: title,
        description: description,
        fields: fields,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
function embedMessageFailureColorWithFields(title, description, fields) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.failure),
        title: title,
        description: description,
        fields: fields,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {fields} fields - Embed's fields
 * @returns {embedReply} An embed message object
 */
function embedMessageWarningColorWithFields(title, description, fields) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.warning),
        title: title,
        description: description,
        fields: fields,
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

module.exports = {
    embedMessage,
    embedMessageWithServerIcon,
    embedMessagePrimaryColor,
    embedMessageSuccessColor,
    embedMessageSuccessSecondaryColor,
    embedMessageFailureColor,
    embedMessageWarningColor,
    embedMessageWithFields,
    embedMessagePrimaryColorWithFields,
    embedMessageSuccessColorWithFields,
    embedMessageSuccessSecondaryColorWithFields,
    embedMessageFailureColorWithFields,
    embedMessageWarningColorWithFields
}