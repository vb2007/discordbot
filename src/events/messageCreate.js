const messageLogging = require("./scripts/messageCreate/messageLogging");
const bridge = require("./scripts/messageCreate/bridge");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    await messageLogging.logMessagesToLocalDatabase(message);
    await bridge.sendMessageToDestinationChannel(client, message);
  },
};
