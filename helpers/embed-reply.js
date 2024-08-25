const { EmbedBuilder } = require("discord.js");

/**
 * 
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

module.exports = {
    embedReply,
    moderationDmEmbedReply,
}