-- discordbot.welcome definition

CREATE TABLE IF NOT EXISTS `welcome` (
    `guildId` varchar(50) NOT NULL,
    `channelId` text DEFAULT NULL,
    `message` text DEFAULT NULL,
    `addedAt` timestamp NOT NULL DEFAULT current_timestamp(),
    `adderId` text DEFAULT NULL,
    `adderUsername` text DEFAULT NULL,
    PRIMARY KEY (`guildId`)
);