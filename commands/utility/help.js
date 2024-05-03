const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

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
                "`/server` - Provides information about the current server.\n" +
                "`/user` - Provides information about a specified user."
                },
                { name: "Fun", value:
                "`/coinflip` - Flips a coin that has a 50/50 chance landing on head or tails.\n" +
                "`/randoming` - Send a random image using the [picsum.photos](https://picsum.photos/) API.\n" +
                "`/randomfeet` - I have nothing to say about my greatest shame..."
                },
                { name: "Moderation", value:
                "**__NOTE__**: The following commands require relevant moderation permissions for both the bot and the command's executer to work.\n" +
                "`/warn` - Warns a specified member on the server.\n" +
                "`/timeout` - Times out a specified member for a specified time.\n" +
                "`/kick` - Kicks a specified member from the server.\n" +
                "`/ban` - Bans a specified member from the server.\n" +
                "`/purge` - Purges (mass deletes) a specified amount of messages from the current channel."
                },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            }
        })

        await interaction.reply({ embeds: [embedReply] });
    }
}