const messageLogging = require("./scripts/messageCreate/messageLogging");
const bridge = require("./scripts/messageCreate/bridge");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        await messageLogging.logMessagesToLocalDatabase(message);
        await bridge.sendMessageToDestinationChannel(message);
    },
};