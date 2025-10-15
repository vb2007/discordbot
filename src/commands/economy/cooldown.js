import { SlashCommandBuilder } from "discord.js";

const commandName = "cooldown";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Display the remaining cooldowns for all economy commands.")
    .setDMPermission(false),
  async execute(interaction) {},
};
