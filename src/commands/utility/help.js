const { SlashCommandBuilder } = require("discord.js");
const {
  embedReplyPrimaryColorWithFields,
  embedReplyFailureColor,
} = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays the bot's commands.")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Displays commands from a specified command category.")
        .addChoices(
          { name: "Utility", value: "utility" },
          { name: "Fun", value: "fun" },
          { name: "Economy", value: "economy" },
          { name: "Moderation", value: "moderation" },
          { name: "Administration", value: "administration" }
        )
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Specify a command's name you would like to know more information about.")
        .setRequired(false)
    )
    .setDMPermission(true),
  async execute(interaction) {
    const commandCategory = interaction.options.getString("category");
    const commandName = interaction.options.getString("command");

    if (commandCategory && commandName) {
      var embedReply = embedReplyFailureColor(
        "Help: Error",
        "Please only provide one parameter at a time for the command.",
        interaction
      );
    } else if (commandCategory) {
      const commandsQuery = await db.query(
        "SELECT name, category FROM commandData WHERE category = ? ORDER BY name",
        [commandCategory]
      );

      if (commandsQuery.length === 0) {
        var embedReply = embedReplyFailureColor(
          "Help: Error",
          "Invalid command category provided as parameter.\nPlease choose a valid category: `utility`, `fun`, `economy`, `moderation`, `administration`.",
          interaction
        );
      } else {
        const commandsList = commandsQuery.map((cmd) => `\`/${cmd.name}\``).join(", ");

        var embedReply = embedReplyPrimaryColorWithFields(
          `Help - ${commandCategory.charAt(0).toUpperCase() + commandCategory.slice(1)} Commands`,
          `Here is a list of the bot's currently available **${commandCategory}** commands:`,
          [{ name: "Commands", value: commandsList }],
          interaction
        );
      }
    } else if (commandName) {
      const commandQuery = await db.query(
        "SELECT category, description FROM commandData WHERE name = ?",
        [commandName]
      );
      const category = commandQuery[0]?.category || null;
      const description = commandQuery[0]?.description || null;

      if (!description) {
        var embedReply = embedReplyFailureColor(
          "Help - Error",
          `There is no such command as \`/${commandName}\`.\nPlease provide a valid command name.`,
          interaction
        );
      } else {
        var embedReply = embedReplyPrimaryColorWithFields(
          `Help - /${commandName}`,
          "You can check out all commands with descriptions on [the bot's wiki](https://github.com/vb2007/discordbot/wiki/Commands)",
          [
            { name: "Category", value: category.charAt(0).toUpperCase() + category.slice(1) },
            { name: "Description", value: description },
          ],
          interaction
        );
      }
    } else {
      const allCommandsQuery = await db.query(
        "SELECT name, category FROM commandData ORDER BY category, name"
      );

      //grouping commands by category
      const commandsByCategory = allCommandsQuery.reduce((acc, cmd) => {
        if (!acc[cmd.category]) {
          acc[cmd.category] = [];
        }
        acc[cmd.category].push(cmd.name);
        return acc;
      }, {});

      //fields for each category
      const categoryFields = Object.entries(commandsByCategory).map(([category, commands]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: commands.map((cmd) => `\`/${cmd}\``).join(", "),
      }));

      var embedReply = embedReplyPrimaryColorWithFields(
        "Help - All Commands",
        "You can check out all commands with descriptions on [the bot's wiki](https://github.com/vb2007/discordbot/wiki/Commands)",
        [
          ...categoryFields,
          {
            name: "Tip.",
            value:
              "You can use `/help <category>` to get a list of commands from a specific category.",
          },
        ],
        interaction
      );
    }

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
