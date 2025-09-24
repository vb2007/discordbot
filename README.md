# Discord bot

<div align="center">

A simple discord bot of mine developed with **Node.js**'s [discord.js](https://www.npmjs.com/package/discord.js?activeTab=readme) package.

[![Unit tests](https://github.com/vb2007/discordbot/actions/workflows/unit-tests.yml/badge.svg?branch=dev)](https://github.com/vb2007/discordbot/actions/workflows/unit-tests.yml) [![Update Wiki Commands](https://github.com/vb2007/discordbot/actions/workflows/wiki-update.yml/badge.svg)](https://github.com/vb2007/discordbot/actions/workflows/wiki-update.yml)

</div>

## Invite the bot

**You can invite the bot to your server using [THIS](https://discord.com/oauth2/authorize?client_id=1163073430309044234&scope=bot&permissions=8) link.**

The bot requires administartor permissions (*&permissions=8*).

I'm hosting it, should be online 24/7.

## Running the application

### Setting up the bot

Do the following for setting up the application from sratch:

1. Clone the repository.
2. Create a `.env` file, or rename the existing [.env.example](./src/.env.example) file, and fill it out with the required data.
3. Create a `config.json` file, or rename the existing [config.json.example](./src/config.json.example) file, and fill it out with the required configuration settings.
4. Like you would with any other node.js app, install dependencies with with the `npm i` command.

### Setting up a database for the bot

Some of the bot's features **require a MariaDB database**.

If you already have a working database, and have filled up the connection details in the `.env` file for the connection, you can just run `npm run create-tables`. This will automatically create the tables based on the SQL queries that can be found in the [sql folder](./src/sql/).

Otherwise, please refer to [THIS](documentation/mariadb-setup.md) documentation for addittional help about setting up a database.

### Running the bot

If everything above checks out, you can prepare for the first run:

1. Deploy the slash (/) commands with `npm run deploy`. You might want to do this again if you modify / add commands.
2. Finally, run the bot with `npm run app`.

#### Running it in the background

If you want to run the application on a Linux system in the background as a systemd service, you can follow [THIS](documentation/systemd-setup.md) guide.
