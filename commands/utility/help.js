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
            "`/help` - Displays this message.\n" +
            "`/ping` - Displays the discord API's current latency.\n" +
            "`/ping-db` - Displays the current latency between the bot and it's database.\n" +
            "`/server` - Provides information about the current server.\n" +
            "`/user` - Provides information about a specified user.\n" +
            "`/translate` - Translates a message from any language to any language.\n" +
            "`/say` - Makes the bot say a specified message."
        };

        const funCommands = 
        { name: "Fun", value:
            "`/coinflip` - Flips a coin that has a 50/50 chance landing on heads or tails.\n" +
            "`/randompic` - Send a random picture using the [picsum.photos](https://picsum.photos/) API.\n" +
            "`/randomfeet` - I have nothing to say about my greatest shame...\n" +
            "`/911-countdown` - Displays huw much time is left until Spetember 11th."
        };

        const economyCommands = 
        { name: "Economy", value:
            "`/work` - Lets you work for a random amount of money.\n" +
            "`/beg` - Lets you beg for a random (or no) amount of money.\n" +
            "`/rob` - Steals a random amount of money from the target user, and adds it to your balance.\n" +
            "`/balance` - Displays the user's current bank and handheld balance.\n" +
            "`/deposit` - Deposits money into the user's bank account. It has a daily limit for free deposits, but the users can choose to pay a small deposit fee if they exceed the limit.\n" +
            "`/withdraw` - Withdraws money from the user's bank account.\n" +
            "`/pay` - Transfers money from one user to another.\n" +
            "`/roulette` - Lets you pick a color, then gives you a great price if you guess the color right.\n" +
            "`/leaderboard` - Displays users with the most money on the server."
        };

        const moderationCommands = 
        { name: "Moderation", value:
            "**__NOTE__**: The following commands require relevant **moderation permissions** for both the bot and the command's executor to work.\n" +
            "`/warn` - Warns a specified member on the server.\n" +
            "`/timeout` - Times out a specified member for a specified time.\n" +
            "`/kick` - Kicks a specified member from the server.\n" +
            "`/ban` - Bans a specified member from the server.\n" +
            "`/purge` - Purges (mass deletes) a specified amount of messages from the current channel."
        };

        const administrationCommands = 
        { name: "Administration", value:
            "**__NOTE__**: The following commands require relevant **administration permissions** for both the bot and the command's executor to work.\n" +
            "`/autorole-configure` - Sets / modifies the autorole feature. When a new member joins the server, a specified role will get assigned to them automatically.\n" +
            "`/autorole-disable` - Disables the autorole feature. New members won't get the specified role automatically on join anymore.\n" +
            "`/welcome-configure` - Sets / modifies the welcome messages feature. When a new member joins the server, the bot send a specified welcome message.\n" +
            "`/welcome-disable` - Disables the welcome messages feature. The bot won't send a welcome message on join anymore.\n" +
            "`/logging-configure` - Sets / modifies the channel where event on the server will get logged.\n" +
            "`/logging-disable` - Disables the logging feature. The bot won't log the events on the server anymore.\n" +
            "`/bridge-configure` - Bridges all messages from one channel to another.\n" +
            "`/bridge-disable` - Disables briding for a target channel.\n" +
            "`/rename` - Renames a specified user to a specified nickname in the current server."
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