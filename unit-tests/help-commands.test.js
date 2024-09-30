const fs = require("fs");
const path = require("path");

describe("/help command test", () => {
    let helpFileContent;
    let commandCategories;

    beforeAll(() => {
        //reads the help.js's content
        const helpFilePath = path.join(_dirname, "..", "commands", "utility", "help.js");
        helpFileContent = fs.readFileSync(helpFilePath, "utf-8");

        commandCategories = {
            utility: "utilityCommands",
            fun: "funCommands",
            economy: "economyCommands",
            moderation: "moderationCommands",
            administration: "administrationCommands"
        }
    });

    Object.keys(commandCategories).forEach(category => {
        test("All commmand in the filesystem should be listed in the /help command's relevant objects.", () => {
            const commandsPath = path.join(_dirname, "..", "commands", category);
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