-- discordbot.commandData definition

CREATE TABLE IF NOT EXISTS `commandData` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `name` text NOT NULL,
    `category` text DEFAULT NULL,
    `description` text DEFAULT NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO commandData (name,category,description) VALUES
	('help','utility','Displays a message with the currently available commands.'),
	('ping','utility','Displays the discord API''s current latency.'),
	('ping-db','utility','Displays the current latency between the bot and it''s database.'),
	('server','utility','Provides information about the current server.'),
	('user','utility','Provides information about a specified user.'),
	('translate','utility','Translates a message from any language to any language.'),
	('say','utility','Makes the bot say a specified message.'),
	('coinflip','fun','Flips a coin that has a 50/50 chance landing on heads or tails.'),
	('randompic','fun','Send a random picture using the [picsum.photos](https://picsum.photos/) API.'),
	('randomfeet','fun','I have nothing to say about my greatest shame...');
INSERT INTO commandData (name,category,description) VALUES
	('911-countdown','fun','Displays huw much time is left until Spetember 11th.'),
	('work','economy','Lets you work for a random amount of money.'),
	('beg','economy','Lets you beg for a random (or no) amount of money.'),
	('rob','economy','Steals a random amount of money from the target user, and adds it to your balance.'),
	('balance','economy','Displays the user''s current bank and handheld balance.'),
	('deposit','economy','Deposits money into the user''s bank account. It has a daily limit for free deposits, but the users can choose to pay a small deposit fee if they exceed the limit.'),
	('withdraw','economy','Withdraws money from the user''s bank account.'),
	('pay','economy','Transfers money from one user to another.'),
	('roulette','economy','Lets you pick a color, then gives you a great price if you guess the color right.'),
	('leaderboard','economy','Displays users with the most money on the server.');
INSERT INTO commandData (name,category,description) VALUES
	('warn','moderation','Warns a specified member on the server.'),
	('timeout','moderation','Times out a specified member for a specified time.'),
	('kick','moderation','Kicks a specified member from the server.'),
	('ban','moderation','Bans a specified member from the server.'),
	('purge','moderation','Purges (mass deletes) a specified amount of messages from the current channel.'),
	('autorole-configure','administration','Sets / modifies the autorole feature. When a new member joins the server, a specified role will get assigned to them automatically.'),
	('autorole-disable','administration','Disables the autorole feature. New members won''t get the specified role automatically on join anymore.'),
	('welcome-configure','administration','Sets / modifies the welcome messages feature. When a new member joins the server, the bot send a specified welcome message.'),
	('welcome-disable','administration','Disables the welcome messages feature. The bot won''t send a welcome message on join anymore.'),
	('logging-configure','administration','Sets / modifies the channel where event on the server will get logged.');
INSERT INTO commandData (name,category,description) VALUES
	('logging-disable','administration','Disables the logging feature. The bot won''t log the events on the server anymore.'),
	('bridge-configure','administration','Bridges all messages from one channel to another.'),
	('bridge-disable','administration','Disables briding for a target channel.'),
	('rename','administration','Renames a specified user to a specified nickname in the current server.');