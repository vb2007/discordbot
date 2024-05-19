const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
//const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nsfl")
        .setDescription("!!GORE!! Gives back an image from the r/NSFL__ subreddit."),
    async execute(interaction) {
        try{
            const apiLink = await fetch(`https://meme-api.com/gimme/NSFL__`);
            const apiJson = await apiLink.json();

            if (apiJson.url) {
                var postTitle = apiJson.title;
                var postUrl = apiJson.url;
            }
            else {
                throw new Error("No post found.");
            }
        }
        catch (error) {
            await interaction.reply({ content: `There was an error fetching from r/NSFL__: ${error.message}`, ephemeral: true });
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "NSFL.",
            description: `Here is a random post from r/NSFL__.`,
            fields: [
				{ name: "Title: ", value: postTitle, inline : false },
            ],
            image: {
                url: `${postUrl}`
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply]});
    }
}