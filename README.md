# Discord bot

A simple discord bot of mine developed with discord.js (Node.js).

I mainly use it to get the active developer badge on Discord.

## Invite the bot

**You can invite the bot to your server using [THIS](https://discord.com/oauth2/authorize?client_id=1163073430309044234&scope=bot&permissions=8) link.**

The bot requires administartor permissions.

I'm hosting it, should be online 24/7.

## Running the application

### Setting up the bot

Do the following for setting up the application from sratch:

1. Clone the repo.
2. Create a `config.json` file in the repo's folder and paste the content above, then fill it out with the correct details:
```json
{
  "token" : "[your token]",
  "clientId" : "[your client id]",

  "databaseHostAddress" : "[database host ip]:[database host port]",
  "databaseName" : "[database name]",
  "databaseUser" : "[database username]",
  "databasePassword" : "[database user's password]",

  "logToFile" : "[True/False]",
  "logToDatabase" : "[True/False]"
}
```
3. Like you would with any other node.js app, install dependencies with with the `npm i` command.

### Setting up a database for the bot

Some of the bot's features require a MariaDB database.

If you already have a working database, and filled up the details in the `config.json` file for the connection, you can run `npm run create-tables`.

This will automatically create the tables based on the SQL queries that can be found in the [sql folder](sql/).

Otherwise, please refer to [THIS](documentation/mariadb-setup.md) documentation for addittional help about setting up a database.

### Running the bot

If everything above checks out, you can prepare for the first run:

1. Deploy the slash (/) commands with `npm run deploy`. You might want to do this again if you modify / add commands.
2. Finally, run the bot with `npm run app`.
