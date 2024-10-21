const messageLogging = require("./scripts/messageCreate/messageLogging");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        await messageLogging.logMessagesToLocalDatabase(message);
    },
};