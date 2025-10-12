import { logMessagesToLocalDatabase } from "./scripts/messageCreate/messageLogging.js";
import { sendMessageToDestinationChannel } from "./scripts/messageCreate/bridge.js";

export default {
  name: "messageCreate",
  async execute(client, message) {
    await logMessagesToLocalDatabase(message);
    await sendMessageToDestinationChannel(client, message);
  },
};
