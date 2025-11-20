import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColor } from "../../helpers/embeds/embed-reply.js";
import { query } from "../../helpers/db.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";

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

    const embedReply = embedReplyPrimaryColor(
      `Word Leaderboard: "${targetWord}"`,
      `${usersQuery.length !== 0 ? `Leaderboard of users whose messages contained the word **${targetWord}** the most:` : `No user has used the word **${targetWord}** in their messages so far.`}`,
      interaction
    );

    return replyAndLog(interaction, embedReply);
  },
};
