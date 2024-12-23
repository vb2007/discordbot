-- discordbot.configLogging definition

CREATE TABLE IF NOT EXISTS `configLogging` (
    `guildId` varchar(50) NOT NULL,
    `logChannelId` text NOT NULL,
    `logChannelName` text DEFAULT NULL,
    `lastModifiedAt` timestamp NOT NULL DEFAULT current_timestamp(),
    `lastModifierId` text DEFAULT NULL,
    `lastModifierName` text DEFAULT NULL,
    `addedAt` timestamp NOT NULL DEFAULT current_timestamp(),
    `firstConfigurerId` text NOT NULL,
    `firstConfigurerName` text NOT NULL,
    PRIMARY KEY (`guildId`)
);

CREATE INDEX IF NOT EXISTS idx_guildId ON configLogging(guildId);
CREATE INDEX IF NOT EXISTS idx_logChannelId ON configLogging(logChannelId);