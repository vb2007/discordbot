const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
  async sendLogInfo(client, message) {
    try {
      //console.log(message);
      const guild = await client.guilds.fetch(message.guildId);
      const { doesGuildExist, logChannelId } = await getGuildFromDB(message.guildId);

      if (doesGuildExist) {
        const logChannel = guild.channels.cache.get(logChannelId);

        const isBotMessage = message.author?.bot;
        const isThisBotsMessage = message.author?.id === client.user.id;
        const isBotsLogDeleted =
          isThisBotsMessage &&
          message.embeds.length > 0 &&
          message.embeds[0]?.title === "Message deleted";
        let logEmbed;

        if (isBotMessage && !isBotsLogDeleted) {
          return;
        }

        if (isBotsLogDeleted) {
          const originalEmbed = message.embeds[0];
          const fieldData = {};

          //extracting field data
          originalEmbed.fields.forEach((field) => {
            fieldData[field.name] = field.value;
          });

          logEmbed = embedMessageFailureColorWithFields(
            "Message deleted",
            'One of the bot\'s "Message deleted" logs was deleted. Here is the restoration:',
            [
              { name: "Content", value: fieldData["Content"] || "No content available" },
              { name: "Author", value: fieldData["Author"] || "Unknown", inline: true },
              {
                name: "Author Username",
                value: fieldData["Author Username"] || "Unknown",
                inline: true,
              },
              { name: "Channel", value: fieldData["Channel"] || "Unknown" },
              { name: "Message Id", value: fieldData["Message Id"] || "Unknown", inline: true },
              { name: "Channel Id", value: fieldData["Channel Id"] || "Unknown", inline: true },
              { name: "Author Id", value: fieldData["Author Id"] || "Unknown", inline: true },
              {
                name: "Previous Log Deleted",
                value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                inline: false,
              },
            ]
          );
        } else {
          let attachments = [];
          if (message.attachments) {
            message.attachments.forEach((url) => {
              attachments.push(url.url);
            });

            logEmbed = embedMessageFailureColorWithFields(
              "Message deleted",
              "A message was deleted.",
              [
                { name: "Content", value: message.content || "No content available" },
                {
                  name: "Attachment(s): available for max. 48 hours",
                  value: attachments.join(", "),
                },
                {
                  name: "Author",
                  value: message.author ? `<@${message.author.id}>` : "Unknown",
                  inline: true,
                },
                {
                  name: "Author Username",
                  value: message.author?.username || "Unknown",
                  inline: true,
                },
                { name: "Channel", value: `<#${message.channelId}>` },
                { name: "Message Id", value: message.id || "Unknown", inline: true },
                { name: "Channel Id", value: message.channelId || "Unknown", inline: true },
                { name: "Author Id", value: message.author?.id || "Unknown", inline: true },
              ]
            );
          } else {
            logEmbed = embedMessageFailureColorWithFields(
              "Message deleted",
              "A message was deleted.",
              [
                { name: "Content", value: message.content || "No content available" },
                {
                  name: "Author",
                  value: message.author ? `<@${message.author.id}>` : "Unknown",
                  inline: true,
                },
                {
                  name: "Author Username",
                  value: message.author?.username || "Unknown",
                  inline: true,
                },
                { name: "Channel", value: `<#${message.channelId}>` },
                { name: "Message Id", value: message.id || "Unknown", inline: true },
                { name: "Channel Id", value: message.channelId || "Unknown", inline: true },
                { name: "Author Id", value: message.author?.id || "Unknown", inline: true },
              ]
            );
          }
        }

        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error(`Failed to send log info to target channel: ${error.stack}`);
    }
  },
};
