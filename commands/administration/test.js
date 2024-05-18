// const { EmbedBuilder, SlashCommandBuilder, PermissionFlagBits } = require("discord.js");
const db = require("../../db");

guildId = "1";
roleId = "1";

db.query("INSERT INTO autorole (guildId, roleId) VALUES (?, ?) ON DUPLICATE KEY UPDATE roleId = ?", [guildId, roleId, roleId] );