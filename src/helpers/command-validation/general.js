const { embedReplyFailureColor } = require("../embeds/embed-reply");
const { capitalizeFirstLetter } = require("../format");

function checkIfNotInGuild(commandName, interaction) {
    if (!interaction.inGuild()) {
        var embedReply = embedReplyFailureColor(
            `${capitalizeFirstLetter(commandName)} - Not in a server`,
            `You can only use the \`/${commandName}\` command in a server.`,
            interaction
        );

        return embedReply;
    }

    return null;
}

module.exports = { checkIfNotInGuild }