-- discordbot.economy definition

CREATE TABLE IF NOT EXISTS `economy` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `userName` text DEFAULT NULL,
    `userId` bigint(20) NOT NULL,
    `balance` bigint(20) DEFAULT 0,
    `balanceInBank` bigint(20) DEFAULT 0,
    `firstTransactionDate` datetime NOT NULL DEFAULT current_timestamp(),
    `lastWorkTime` datetime DEFAULT NULL,
    `lastBegTime` datetime DEFAULT NULL,
    `lastRobTime` datetime DEFAULT NULL,
    `lastRouletteTime` datetime DEFAULT NULL,
    `lastBlackjackTime` datetime DEFAULT NULL,
    `lastCoinflipTime` datetime DEFAULT NULL,
    `lastDepositTime` datetime DEFAULT NULL,
    `dailyDeposits` int DEFAULT 0 NOT NULL,
    `robSuccessChance` float DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `userId` (`userId`)
);

CREATE INDEX IF NOT EXISTS idx_userId ON economy(userId);