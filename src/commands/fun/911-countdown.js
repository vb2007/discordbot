import { SlashCommandBuilder } from "discord.js";
import {
  embedReplyPrimaryColorWithFields,
  embedReplyPrimaryColor,
} from "../../helpers/embeds/embed-reply.js";
import { replyAndLog } from "../../helpers/reply.js";

const commandName = "911-countdown";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Displays how much time is left until 9/11.")
    .addStringOption((option) =>
      option
        .setName("utc-offset")
        .setDescription("The offset that the bot will calculate the time difference with.")
        .addChoices(
          //according to wikipedia: https://en.wikipedia.org/wiki/List_of_UTC_offsets
          //i had to remove some of the options because discord only allows 25 choices
          { name: "UTC-12", value: "-12" },
          { name: "UTC-11", value: "-11" },
          { name: "UTC-10", value: "-10" },
          { name: "UTC-9", value: "-9" },
          // { name: "UTC-9:30", value: "-9.5" },
          { name: "UTC-8", value: "-8" },
          { name: "UTC-7", value: "-7" },
          { name: "UTC-6", value: "-6" },
          { name: "UTC-5", value: "-5" },
          { name: "UTC-4", value: "-4" },
          { name: "UTC-3", value: "-3" },
          // { name: "UTC-3:30", value: "-3.5" },
          { name: "UTC-2", value: "-2" },
          { name: "UTC-1", value: "-1" },
          { name: "UTC+0", value: "0" },
          { name: "UTC+1", value: "1" },
          { name: "UTC+2", value: "2" },
          { name: "UTC+3", value: "3" },
          // { name: "UTC+3:30", value: "3.5" },
          { name: "UTC+4", value: "4" },
          // { name: "UTC+4:30", value: "4.5" },
          { name: "UTC+5", value: "5" },
          // { name: "UTC+5:30", value: "5.5" },
          // { name: "UTC+5:45", value: "5.75" },
          { name: "UTC+6", value: "6" },
          // { name: "UTC+6:30", value: "6.5" },
          { name: "UTC+7", value: "7" },
          { name: "UTC+8", value: "8" },
          // { name: "UTC+8:45", value: "8.75" },
          { name: "UTC+9", value: "9" },
          // { name: "UTC+9:30", value: "9.5" },
          { name: "UTC+10", value: "10" },
          // { name: "UTC+10:30", value: "10.5" },
          { name: "UTC+11", value: "11" },
          { name: "UTC+12", value: "12" }
          // { name: "UTC+12:45", value: "12.75" },
          // { name: "UTC+13", value: "13" },
          // { name: "UTC+14", value: "14" }
        )
        .setRequired(false)
    )
    .setDMPermission(true),
  async execute(interaction) {
    let title;
    let description;

    const now = new Date();
    const utcOffset = parseFloat(interaction.options.getString("utc-offset") || "0");
    const offsetMilliseconds = utcOffset * 60 * 60 * 1000;
    const adjustedNow = new Date(now.getTime() + offsetMilliseconds);

    const currentYear = adjustedNow.getUTCFullYear();
    const targetDate = new Date(Date.UTC(currentYear, 8, 11)); //8, because months are 0-indexed

    if (adjustedNow.getUTCMonth() === 8 && adjustedNow.getUTCDate() === 11) {
      title = "9/11 Countdown";
      description =
        "Today is the day! :tada:\nHappy 9/11! Never forget those dancing jews. :partying_face:";
      return await replyAndLog(
        interaction,
        embedReplyPrimaryColor(title, description, interaction)
      );
    }

    if (adjustedNow > targetDate) {
      targetDate.setUTCFullYear(currentYear + 1);
    }

    const timeDiffernce = targetDate - adjustedNow;

    const days = Math.floor(timeDiffernce / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiffernce % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffernce % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiffernce % (1000 * 60)) / 1000);

    if (utcOffset === 0) {
      var embedReply = embedReplyPrimaryColorWithFields(
        "911 Countdown",
        "",
        [
          {
            name: "Time left until 9/11",
            value: `**${days}** days **${hours}** hours **${minutes}** minutes **${seconds}** seconds`,
          },
        ],
        interaction
      );

      return await replyAndLog(interaction, embedReply);
    }

    var embedReply = embedReplyPrimaryColorWithFields(
      "911 Countdown",
      "",
      [
        {
          name: "Time left until 9/11",
          value: `**${days}** days **${hours}** hours **${minutes}** minutes **${seconds}** seconds`,
        },
        {
          name: "UTC Offset",
          value: `UTC${utcOffset >= 0 ? "+" : ""}${utcOffset}`,
        },
      ],
      interaction
    );

    return await replyAndLog(interaction, embedReply);
  },
};
