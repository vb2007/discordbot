CREATE TABLE IF NOT EXISTS `log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `command` TEXT(50),
    `executerUserName` TEXT,
    `executerUserId` INT,
    `isInServer` TINYINT(1),
    `serverName` TEXT,
    `serverId` INT,
    `channelName` TEXT,
    `channelId` INT,
    `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `response` TEXT,
    PRIMARY KEY (`id`)
);