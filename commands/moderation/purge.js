const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purges (mass deletes) a specified amount of messages from the current channel.")
        .addNumberOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of messages the bot will purge.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const messageAmount = interaction.options.get("amount").value;
        
        if (!interaction.inGuild()) {
            var replyContent = "You can only purge messages in a server.";
        }
        else if (messageAmount > 100){
            var replyContent = "Cannot delete more than 100 messages at once due to Discord's limitations.";
        }
        else{
            try{
                await interaction.channel.bulkDelete(messageAmount);
                var replyContent = `Deleted ${messageAmount} messages successfully.`;
            }
            catch (error){
                console.error(error);
                var replyContent = "There was an error trying to purge the messages.";
            }
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Purging messages.",
            description: `${replyContent}`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.inGuild() ? `${interaction.guild.name} (ID: ${interaction.guild.id})` : "Not in a server." }\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        //console.log(logMessage);

        fs.appendFile("log/command-purge.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}