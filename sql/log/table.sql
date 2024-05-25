CREATE TABLE IF NOT EXISTS `log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `commandName` TEXT(50),
    `executorUserName` TEXT,
    `executorUserId` BIGINT,
    `isInServer` BOOLEAN,
    `serverName` TEXT,
    `serverId` BIGINT,
    `channelName` TEXT,
    `channelId` BIGINT,
    `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `response` TEXT,
    PRIMARY KEY (`id`)
);