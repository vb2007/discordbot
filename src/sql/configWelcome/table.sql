-- discordbot.configWelcome definition

CREATE TABLE IF NOT EXISTS `configWelcome` (
    `guildId` varchar(50) NOT NULL,
    `channelId` text DEFAULT NULL,
    `message` text DEFAULT NULL,
    `isEmbed` tinyint(1) NOT NULL DEFAULT 0,
    `embedColor` int DEFAULT NULL,
    `addedAt` timestamp NOT NULL DEFAULT current_timestamp(),
    `adderId` text DEFAULT NULL,
    `adderUsername` text DEFAULT NULL,
    PRIMARY KEY (`guildId`)
);