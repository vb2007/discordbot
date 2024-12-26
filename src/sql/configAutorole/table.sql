-- discordbot.configAutorole definition

CREATE TABLE IF NOT EXISTS `configAutorole` (
    `guildId` varchar(50) NOT NULL,
    `roleId` text DEFAULT NULL,
    `addedAt` timestamp NOT NULL DEFAULT current_timestamp(),
    `adderId` text DEFAULT NULL,
    `adderUsername` text DEFAULT NULL,
    PRIMARY KEY (`guildId`)
);