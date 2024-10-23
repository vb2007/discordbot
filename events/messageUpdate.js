const messageLogging = require("./scripts/messageUpdate/messageLogging");

module.exports = {
    name: "messageUpdate",
    async execute(oldMessage, newMessage) {
        await messageLogging.logMessagesToLocalDatabase(oldMessage, newMessage);
    },
};