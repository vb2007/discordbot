const { SlashCommandBuilder } = require("discord.js");
const {
  embedReplyPrimaryColor,
  embedReplyFailureColor,
} = require("../../helpers/embeds/embed-reply");
const replyAndLog = require("../../helpers/reply");

const commandName = "cigany";

module.exports = {
  data: new SlashCommandBuilder().setName(commandName).setDescription("fuj"),
  async execute(interaction) {
    let title;
    let description;

    try {
      title = "Cigány";
      description = "Fuj";

      return await replyAndLog(
        interaction,
        embedReplyPrimaryColor(title, description, interaction),
      );
    } catch (error) {
      title = "Error";
      description = "Meg ciganyozni se tud a bot. :(";

      return await replyAndLog(
        interaction,
        embedReplyFailureColor(title, description, interaction),
      );
    }
  },
};
