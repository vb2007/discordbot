const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColorWithFields, embedReplyErrorColorWithFields } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

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
        .setDMPermission(true),
    async execute(interaction) {
        const commandCategory = interaction.options.getString("category");

        const utilityCommands = 
        { name: "Utility", value:
            "`/help`\n" +
            "`/ping`\n" +
            "`/ping-db`\n" +
            "`/server`\n" +
            "`/user`\n" +
            "`/translate`\n" +
            "`/say`"
        };

        const funCommands = 
        { name: "Fun", value:
            "`/coinflip`\n" +
            "`/randompic`\n" +
            "`/randomfeet`\n" +
            "`/911-countdown`"
        };

        const economyCommands = 
        { name: "Economy", value:
            "`/work`\n" +
            "`/beg`\n" +
            "`/rob`\n" +
            "`/balance`\n" +
            "`/deposit`\n" +
            "`/withdraw`\n" +
            "`/pay`\n" +
            "`/roulette`\n" +
            "`/leaderboard`"
        };

        const moderationCommands = 
        { name: "Moderation", value:
            "**__NOTE__**: The following commands require relevant **moderation permissions** for both the bot and the command's executor to work.\n" +
            "`/warn`\n" +
            "`/timeout`\n" +
            "`/kick`\n" +
            "`/ban`\n" +
            "`/purge`"
        };

        const administrationCommands = 
        { name: "Administration", value:
            "**__NOTE__**: The following commands require relevant **administration permissions** for both the bot and the command's executor to work.\n" +
            "`/autorole-configure`\n" +
            "`/autorole-disable`\n" +
            "`/welcome-configure`\n" +
            "`/welcome-disable`\n" +
            "`/logging-configure`\n" +
            "`/logging-disable`\n" +
            "`/bridge-configure`\n" +
            "`/bridge-disable`\n" +
            "`/rename`"
        };

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