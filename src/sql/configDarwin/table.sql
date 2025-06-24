-- discordbot.configDarwin definition

CREATE TABLE IF NOT EXISTS `configDarwin` (
    `guildId` BIGINT PRIMARY KEY,
    `channelId` BIGINT NOT NULL,
    `channelName` VARCHAR(100) NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `feedUrl` VARCHAR(255) NOT NULL DEFAULT 'https://theync.com/most-recent/',
    `interval` INT NOT NULL DEFAULT 30000,
    `markerOne` VARCHAR(255) NOT NULL DEFAULT 'https://theync.com/media/video',
    `markerTwo` VARCHAR(255) NOT NULL DEFAULT 'https://theync.com',
    `adderId` BIGINT NOT NULL,
    `adderUsername` VARCHAR(100) NOT NULL
);