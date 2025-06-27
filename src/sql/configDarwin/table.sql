-- discordbot.configDarwin definition

CREATE TABLE IF NOT EXISTS `configDarwin` (
    `guildId` BIGINT PRIMARY KEY,
    `channelId` BIGINT NOT NULL,
    `channelName` VARCHAR(100) NOT NULL,
    `adderId` BIGINT NOT NULL,
    `adderUsername` VARCHAR(100) NOT NULL
);