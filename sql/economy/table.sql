CREATE TABLE IF NOT EXISTS `economy` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userName` TEXT,
    `userId` BIGINT NOT NULL,
    `balance` BIGINT DEFAULT 0,
    `firstTransactionId` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `lastWorkTime` DATETIME
    `lastRobTime` DATETIME,
    `robSuccessChance` FLOAT DEFAULT 1,
    PRIMARY KEY (`id`)
);