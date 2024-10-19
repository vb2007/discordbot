const logging = require("./scripts/messageCreate/logging");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        await logging.logMessage(message);
    },
};