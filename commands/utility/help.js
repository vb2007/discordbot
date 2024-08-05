const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays the bot's commands."),
    async execute(interaction) {
        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Help.",
            description: "Here is a list of the bot's currently avaliable commands:",
            fields: [
                { name: "Utility", value:
                "`/help` - Displays this message.\n" +
                "`/ping` - Displays the discord API's current latency.\n" +
                "`/ping-db` - Displays the current latency between the bot and it's database.\n" +
                "`/server` - Provides information about the current server.\n" +
                "`/user` - Provides information about a specified user."
                },
                { name: "Fun", value:
                "`/coinflip` - Flips a coin that has a 50/50 chance landing on heads or tails.\n" +
                "`/randompic` - Send a random picture using the [picsum.photos](https://picsum.photos/) API.\n" +
                "`/randomfeet` - I have nothing to say about my greatest shame..."
                },
                { name: "Economy", value:
                "`/work` - Adds a random amount of money to your balance.\n" +
                "`/rob` - Steals a random amount of money from the target user, and adds it to your balance.\n" +
                "`/balance` - Displays the user's balance.\n" +
                // "`/deposit` - Deposits money into the user's bank account.\n" +
                // "`/withdraw` - Withdraws money from the user's bank account.\n" +
                // "`/transfer` - Transfers money from one user to another.\n" +
                "`/leaderboard` - Displays users with the most money on the server."
                },
                { name: "Moderation", value:
                "**__NOTE__**: The following commands require relevant **moderation permissions** for both the bot and the command's executor to work.\n" +
                "`/warn` - Warns a specified member on the server.\n" +
                "`/timeout` - Times out a specified member for a specified time.\n" +
                "`/kick` - Kicks a specified member from the server.\n" +
                "`/ban` - Bans a specified member from the server.\n" +
                "`/purge` - Purges (mass deletes) a specified amount of messages from the current channel."
                },
                { name: "Administration", value:
                "**__NOTE__**: The following commands require relevant **administration permissions** for both the bot and the command's executor to work.\n" +
                "`/autorole-configure` - Sets / modifies the autorole feature. When a new member joins the server, a specified role will get assigned to them automatically.\n" +
                "`/autorole-disable` - Disables the autorole feature. New members won't get the specified role automatically on join anymore.\n"
                },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            }
        })

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}