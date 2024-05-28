CREATE TABLE IF NOT EXISTS `economy` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userName` TEXT,
    `userId` BIGINT,
    `balance` BIGINT,
    `firstTransactionId` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);