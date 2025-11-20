import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColor } from "../../helpers/embeds/embed-reply.js";
import { positionEmojis } from "../../helpers/format.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";
import { query } from "../../helpers/db.js";

const commandName = "word-leaderboard";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    // Counts a specified word in the current server and sends back a leaderboard with the users who used that word the most.
    .setDescription(
      "Gives back a word count leaderboard with the top users who used that word the most."
    )
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The word that will get counted.")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(12)
    )
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply();

    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const targetWord = interaction.options.getString("word");
    const currentServerId = interaction.guild.id;

    const usersQuery = await query(
      `SELECT senderUserId, senderUserName, COUNT(*) as wordCount
       FROM messageLog
       WHERE serverId = ? AND messageContent LIKE ?
       GROUP BY senderUserId
       ORDER BY wordCount DESC
       LIMIT 10`,
      [currentServerId, `%${targetWord}%`]
    );
    console.log(usersQuery);

    let leaderboardContent = "";
    for (let i = 0; i < usersQuery.length; i++) {
      const userResult = usersQuery[i];
      const emoji = positionEmojis[i + 1];

      let username;
      try {
        const member = await interaction.guild.members.fetch(userResult.senderUserId);
        username = member.user.username;
      } catch (error) {
        username = userResult.senderUserName || "Unknown username";
      }

      leaderboardContent += `${emoji} <@${userResult.senderUserId}> (${username}): **#${userResult.wordCount}**\n`;
    }

    const embedReply = embedReplyPrimaryColor(
      `Word Leaderboard: "${targetWord}"`,
      usersQuery.length !== 0
        ? `Leaderboard of users whose messages contained the word **${targetWord}** the most:\n\n${leaderboardContent}`
        : `:x: No user has used the word **${targetWord}** in their messages so far.`,
      interaction
    );

    await interaction.editReply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
