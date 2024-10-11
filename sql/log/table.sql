-- discordbot.log definition

CREATE TABLE IF NOT EXISTS `log` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `commandName` tinytext DEFAULT NULL,
    /* tinytext = max. 255 characters */
    `executorUserName` text DEFAULT NULL,
    `executorUserId` bigint(20) DEFAULT NULL,
    `isInServer` tinyint(1) DEFAULT NULL,
    `serverName` text DEFAULT NULL,
    `serverId` bigint(20) DEFAULT NULL,
    `channelName` text DEFAULT NULL,
    `channelId` bigint(20) DEFAULT NULL,
    `time` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
    `response` text DEFAULT NULL COMMENT 'Embed object that the bot sends back to the command''s executor.',
    PRIMARY KEY (`id`)
);