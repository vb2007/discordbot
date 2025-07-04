const { EmbedBuilder } = require("discord.js");
const { embedColors } = require("../../../config.json");

/**
 * Generate message for Discord channel
 * @param {string} title - Video title
 * @param {string} href - Source URL
 * @param {string} directStreamLink - Direct streaming link
 * @param {string} comments - Comments/forum URL
 * @param {boolean} canBeStreamed - Whether video can be streamed
 * @param {number} fileSize - File size in MB
 * @returns {string} - Formatted embed message object
 */
function embedMessageDarwin(title, href, directStreamLink, comments, canBeStreamed, fileSize) {
    const embedReply = new EmbedBuilder({
        color: parseInt(embedColors.failure),
        title: title,
        url: (canBeStreamed ? directStreamLink : href),
        fields:
        [
            { name: "Video", value: (canBeStreamed ? `[[ STREAMING & DOWNLOAD ]](${directStreamLink})` : `[[ ORIGINAL SOURCE'S MP4 ]](${href})`), inline: true },
            { name: "Forum post", value: `[[ VIDEO'S FORUM POST ]](<${comments}>)`, inline: true }
        ],
        timestamp: new Date().toISOString()
    });

    return embedReply;
}

module.exports = {
    embedMessageDarwin,
};