-- discordbot.messageLog definition

CREATE TABLE IF NOT EXISTS `messageLog` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `messageContent` text NOT NULL,
    `senderUserName` text DEFAULT NULL,
    `senderUserId` bigint(20) DEFAULT NULL,
    `serverName` text DEFAULT NULL,
    `serverId` bigint(20) DEFAULT NULL,
    `channelName` text DEFAULT NULL,
    `channelId` bigint(20) DEFAULT NULL,
    `sentOn` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
    `deletedOn` TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;