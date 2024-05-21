# Discord bot

A simple discord bot of mine developed with discord.js (Node.js).

I mainly use it to get the active developer badge on Discord.

## Invite the bot

**You can invite the bot to your server using [THIS](https://discord.com/oauth2/authorize?client_id=1163073430309044234&scope=bot&permissions=8) link.**

The bot requires administartor permissions.

I'm hosting it, should be online 24/7.

## Running the application

### Setting up the bot

Do the following for running this application locally:

1. Clone the repo
2. Create a `config.json` file in it's folder and insert the following:
```json
{
  "token": "[your token]",
  "clientId": "[your client id]",

  //Connecting to the MariaDB database
  "databaseHostAddress" : "[database host ip]:[database host port]",
  "databaseName" : "[database name]",
  "databaseUser" : "[database username]",
  "databasePassword" : "[database user's password]"
}
```
3. Install the dependecies with the `npm i` command
4. Run the app with the `npm run app` command
5. (Optional) To redeploy the / commands, run `npm run deploy`

### Setting up a database for the bot

Some of the bot's features require a MariaDB database.

If you already have a working database, and filled up the details in the `config.json` file for the connection, you can run `npm run create-tables`.

This will automatically create the tables based on the SQL queries that can be found in the [sql folder](sql/).

Otherwise, please refer to [THIS](documentation/mariadb-setup.md) documentation for addittional help about setting up a database.