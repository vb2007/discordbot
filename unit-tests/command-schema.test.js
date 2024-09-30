const fs = require("fs");
const path = require("path");

describe("Command structure base test.", () => {
    test("All commands should have \"data\" and \"execute\" properties.", () => {
        const foldersPath = path.join(__dirname, "..", "commands");
        const commandFolders = fs.readdirSync(foldersPath);

        commandFolders.forEach(folder => {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

            commandFiles.forEach(file => {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                expect(command).toHaveProperty("data");
                expect(command).toHaveProperty("execute");
            })
        })
    });
});