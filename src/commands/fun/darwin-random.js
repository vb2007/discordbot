import { SlashCommandBuilder } from "discord.js";
import { query } from "../../helpers/db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("darwin-random")
    .setDescription("Sends back a random streamable video from Darwin's database.")
    .setNSFW(false)
    .setDMPermission(true),
  async execute(interaction) {
    const randomVideo = query("SELECT * COUNT FROM darwinCache");
    console.log(randomVideo);
  },
};
