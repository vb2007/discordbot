const { EmbedBuilder } = require("discord.js");

function embedReply(color, title, description) {
    const embedReply = new EmbedBuilder({
        color: color,
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

function moderationDmEmbedReply(color, title, description) {
    const embedDmReply = new EmbedBuilder({
        color: color,
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