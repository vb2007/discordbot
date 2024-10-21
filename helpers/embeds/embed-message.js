/**
 * @param {color} color - Embed's sidebar HEX Color
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed reply object
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
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @returns {embedReply} An embed reply object
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
 * @returns {embedReply} An embed reply object
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
 * @returns {embedReply} An embed reply object
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
 * @returns {embedReply} An embed reply object
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
 * @returns {embedReply} An embed reply object
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

odule.exports = {
    embedMessage,
    embedMessagePrimaryColor,
    embedMessageSuccessColor,
    embedMessageSuccessSecondaryColor,
    embedMessageFailureColor,
    embedMessageWarningColor
}