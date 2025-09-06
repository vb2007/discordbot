const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor, embedReplySuccessSecondaryColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild, checkAdminPermissions } = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "config-bridge";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Sets up bridging between a source channel on another server and a destination channel.") //...on the current one. [discord character limit]
        .addStringOption(option =>
            option
                .setName("action")
                .setDescription("Configure or disable the bridging feature?")
                .addChoices(
                    { name: "configure", value: "configure" },
                    { name: "disable", value: "disable" }
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("source-channel-id")
                .setDescription("The ID of the source channel on another server.")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("destination-channel")
                .setDescription("A channel where the bot will send the bridged messages.")
                .addChannelTypes(0)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        let title;
        let description;

        const action = interaction.options.getString("action");

        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        const permissionCheck = checkAdminPermissions(commandName, interaction);
        if (permissionCheck) {
            return await replyAndLog(interaction, permissionCheck);
        }

        if (action === "configure") {
            try {
                const sourceChannelId = interaction.options.getString("source-channel-id");
                const destinationChannel = interaction.options.getChannel("destination-channel");

                const guildId = interaction.guild.id;
                const guildName = interaction.guild.name;
                const destinationChannelId = destinationChannel.id;
                const destinationChannelName = destinationChannel.name;
                const interactionUserId = interaction.user.id;
                const interactionUsername = interaction.user.username;

                const query = await db.query("SELECT destinationChannelId, sourceChannelId, destinationGuildId FROM configBridging WHERE sourceChannelId = ? AND destinationChannelId = ?", [sourceChannelId, destinationChannelId]);
                const destinationGuildId = query[0]?.destinationGuildId || null;
                const existingSourceChannelId = query[0]?.sourceChannelId || null;
                const existingDestinationChannelId = query[0]?.destinationChannelId || null;

                if (existingSourceChannelId == sourceChannelId && existingDestinationChannelId == destinationChannelId && destinationGuildId == guildId) {
                    var embedReply = embedReplyFailureColor(
                        "Bridge Configure: Error",
                        `Bridging has already been configured for the channel <#${sourceChannelId}> (\`${sourceChannelId}\`). :x:\n`,
                        interaction
                    );
                }
                else if (existingSourceChannelId == sourceChannelId && destinationGuildId == guildId) {
                    var embedReply = embedReplySuccessSecondaryColor(
                        "Bridge Configure: Configuration Modified",
                        `The destination channel for <#${sourceChannelId}> (\`${sourceChannelId}\`) has been updated to <#${destinationChannelId}>. :white_check_mark:\nRun this command again to modify the channel.`,
                    );

                    await db.query("UPDATE configBridging SET destinationChannelId = ?, destinationChannelName = ?, adderId = ?, adderUsername = ? WHERE sourceChannelId = ? AND destinationChannelId = ?",
                        [
                            destinationChannelId,
                            destinationChannelName,
                            interactionUserId,
                            interactionUsername,
                            sourceChannelId,
                            destinationChannelId
                        ]
                    );
                }
                else if (existingSourceChannelId != sourceChannelId && destinationGuildId == guildId) {
                    var embedReply = embedReplySuccessColor(
                        "Bridge Configure: Success",
                        `Another channel has been added to bridging successfully. :white_check_mark:\nMessages from <#${sourceChannelId}> (\`${sourceChannelId}\`) will now get bridged to <#${destinationChannelId}>.`,
                    );

                    await db.query("INSERT INTO configBridging (sourceChannelId, destinationGuildId, destinationGuildName, destinationChannelId, destinationChannelName, adderId, adderUsername) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [
                            sourceChannelId,
                            guildId,
                            guildName,
                            destinationChannelId,
                            destinationChannelName,
                            interactionUserId,
                            interactionUsername
                        ]
                    );
                }
                else {
                    var embedReply = embedReplySuccessColor(
                        "Bridge Configure: Success",
                        `Bridging has been successfully configured. :white_check_mark:\nMessages from <#${sourceChannelId}> (\`${sourceChannelId}\`) will now get bridged to <#${destinationChannelId}>.`,
                        interaction
                    );

                    await db.query("INSERT INTO configBridging (sourceChannelId, destinationGuildId, destinationGuildName, destinationChannelId, destinationChannelName, adderId, adderUsername) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [
                            sourceChannelId,
                            guildId,
                            guildName,
                            destinationChannelId,
                            destinationChannelName,
                            interactionUserId,
                            interactionUsername
                        ]
                    );
                }
            }
            catch (error) {
                console.error(`Failed to configure bridging: ${error.message}\n${error.stack}`);
                var embedReply = embedReplyFailureColor(
                    "Bridge Configure: Error",
                    "Failed to configure bridging. Please try again.",
                    interaction
                );  
            }
        }
        

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}