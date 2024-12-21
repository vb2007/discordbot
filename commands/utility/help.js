const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColorWithFields, embedReplyErrorColorWithFields, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays the bot's commands.")
        .addStringOption(option =>
            option
                .setName("category")
                .setDescription("Displays commands from a specified command category.")
                .addChoices(
                    { name: "Utility", value: "utility" },
                    { name: "Fun", value: "fun" },
                    { name: "Economy", value: "economy" },
                    { name: "Moderation", value: "moderation" },
                    { name: "Administration", value: "administration" },
                )
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName("commandName")
                .setDescription("Specify a command's name you would like to know more information about.")
                .setRequired(false))
        .setDMPermission(true),
    async execute(interaction) {
        const commandCategory = interaction.options.getString("category");
        const commandName = interaction.options.getString("commandName");
        
        if (commandCategory && command) {
            var embedReply = embedReplyFailureColor(
                "Help: Error",
                "Please only provide one parameter for the command.",
                interaction
            );
        }
        if (!commandCategory) {
            const commandsQuery = await db.query("SELECT name, category FROM commandData WHERE category = ?", [commandCategory]);
            console.log(commandsQuery);
        }
        else if (!command) {
            const commandQuery = await db.query("SELECT category, description FROM commandData WHERE name = ?", [commandName]);
            const category = commandQuery[0]?.category || "Unknown";
            const description = commandQuery[0]?.description || "Unknown";

            var embedReply = embedReplyPrimaryColorWithFields(
                `Help: /${commandName}`,
                "",
                [
                    { name: "Category", value: category },
                    { name: "Description", value: description }
                ],
                interaction
            );
        }
        else {

        }

        const tipField = 
        { name: "Tip.", value:
            "**Friendly reminder**: You can use `/help <category>` to get a list of commands from a specific category. :grin:"
        }

        const errorField =
        { name: "Error", value:
            "Invalid command category provided as parameter.\n" +
            "Please choose a valid category: `utility`, `fun`, `economy`, `moderation`, `administration`."
        }

        let embedReply;
        if (!commandCategory) {
            embedReply = embedReplyPrimaryColorWithFields(
                "Help - All Commands.",
                "Here is a list of the bot's currently avaliable commands:",
                [ utilityCommands, funCommands, economyCommands, moderationCommands, administrationCommands, tipField ],
                interaction
            );
        }
        else {
            switch (commandCategory) {
                case "utility":
                    embedReply = embedReplyPrimaryColorWithFields(
                        "Help - Utility Commands.",
                        "Here is a list of the bot's currently avaliable **utility** commands:",
                        [ utilityCommands ],
                        interaction
                    );
                    break;
                case "fun":
                    embedReply = embedReplyPrimaryColorWithFields(
                        "Help - Fun Commands.",
                        "Here is a list of the bot's currently avaliable **fun** commands:",
                        [ funCommands ],
                        interaction
                    );
                    break;
                case "economy":
                    embedReply = embedReplyPrimaryColorWithFields(
                        "Help - Economy Commands.",
                        "Here is a list of the bot's currently avaliable **economy** commands:",
                        [ economyCommands ],
                        interaction
                    );
                    break;
                case "moderation":
                    embedReply = embedReplyPrimaryColorWithFields(
                        "Help - Moderation Commands.",
                        "Here is a list of the bot's currently avaliable **moderation** commands:",
                        [ moderationCommands ],
                        interaction
                    );
                    break;
                case "administration":
                    embedReply = embedReplyPrimaryColorWithFields(
                        "Help - Administration Commands.",
                        "Here is a list of the bot's currently avaliable **administration** commands:",
                        [ administrationCommands ],
                        interaction
                    );
                    break;
                default:
                    embedReply = embedReplyErrorColorWithFields(
                        "Help - Utility Commands.",
                        "Here is a list of the bot's currently avaliable **utility** commands:",
                        [ errorField ],
                        interaction
                    );
            }
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}