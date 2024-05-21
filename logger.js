const fs = require("fs");
const path = require("path");
const db = require("./db");
const { logToFile, logToDatabase } = require("./config.json");

const logDirectory = path.join(__dirname, "command-logs");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logToFileAndDatabase = async (interaction, response) => {
    const logMessage = `Command: ${interaction.commandName}
    Executor: ${interaction.user.tag} (ID: ${interaction.user.id})
    Server: ${interaction.inGuild() ? `${interaction.guild.name} (ID: ${interaction.guild.id})` : "Not in a server."}
    Channel: ${interaction.channel.name} (ID ${interaction.channel.id})
    Time: ${new Date(interaction.createdTimestamp).toLocaleString()}
    Response: ${response}
    `;

    //logging to file
    if (logToFile == "True") {
        const logFilePath = path.join(logDirectory, `${interaction.commandName}.log`);

        fs.appendFile(logFilePath, logMessage, (error) => {
            if (error) {
                console.error("Error while wrinting logs to fie: ", error);
            }
        });
    }

    //logging to database
    if (logToDatabase == "True") {
        try {
            let isInServer;
            if (isInServer = interaction.inGuild()){
                isInServer = 1;
            }
            else {
                isInServer = 0;
            }

            //insert data into the log table
            await db.query(
                `INSERT INTO log (commandName, executorUserName, executorUserId, isInServer, serverName, serverId, channelName, channelId, time, response) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    interaction.commandName,
                    interaction.user.username,
                    parseInt(interaction.user.id),
                    isInServer,
                    interaction.guild.name,
                    parseInt(interaction.guild.id),
                    interaction.channel.name,
                    parseInt(interaction.channel.id),
                    new Date(interaction.createdTimestamp).toISOString().slice(0, 19).replace('T', ' '),
                    response
                ]
            );
        }
        catch (error) {
            console.error("Error while writing logs to database: ", error);
        }
    }
};

module.exports = { logToFileAndDatabase };