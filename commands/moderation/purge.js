const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { logToFileAndDatabase } = require("../../logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purges (mass deletes) a specified amount of messages from the current channel.")
        .addNumberOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of messages the bot will purge.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
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

        const deleteButton = new ButtonBuilder()
            .setCustomId("delete")
            .setLabel("Delete message")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(deleteButton);

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

        await interaction.reply({
            embeds: [embedReply],
            components: [row]
        });

        const filter = i => i.customId === 'delete' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 100000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            await i.deleteReply();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ components: [] });
            }
        });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}