CREATE TABLE IF NOT EXISTS `log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `commandName` TEXT(50),
    `executorUserName` TEXT,
    `executorUserId` INT,
    `isInServer` BOOLEAN,
    `serverName` TEXT,
    `serverId` INT,
    `channelName` TEXT,
    `channelId` INT,
    `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `response` TEXT,
    PRIMARY KEY (`id`)
);