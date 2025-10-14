import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

import "dotenv/config";
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  //getting .js files from the commands folder
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

  //checking and storing the commands
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = new URL(`file://${filePath}`).href;
    const commandModule = await import(fileUrl);
    const command = commandModule.default;

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started registering ${commands.length} slash (/) commands at Discord.`);

    //registering / re-registering the commands
    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(`Registered ${commands.length} slash (/) commands at Discord.`);
  } catch (err) {
    console.error("Error while registering commands: ", err);
  }
})();
