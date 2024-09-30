const fs = require("fs");
const path = require("path");

describe("/help command test", () => {

    const helpFilePath = path.join(__dirname, "..", "commands", "utility", "help.js");
    const helpFileContent = fs.readFileSync(helpFilePath, "utf-8");

    const commandCategories = {
        utility: "utilityCommands",
        fun: "funCommands",
        economy: "economyCommands",
        moderation: "moderationCommands",
        administration: "administrationCommands"
    }

    Object.keys(commandCategories).forEach(category => {
        test("All commmand in the filesystem should be listed in the /help command's relevant objects.", () => {
            const commandsPath = path.join(__dirname, "..", "commands", category);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

            commandFiles.forEach(file => {
                const commandName = `/${file.replace(".js", "")}`;
                const commandListObject = commandCategories[category];

                expect(helpFileContent).toContain(commandListObject);
                expect(helpFileContent).toContain(commandName);
            });
        });
    });
});