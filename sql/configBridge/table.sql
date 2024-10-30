-- discordbot.configBridge definition

CREATE TABLE IF NOT EXISTS `configBridge` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `sourceChannelId` varchar(50) NOT NULL,
    `destinationGuildId` varchar(50) NOT NULL,
    `destinationGuildName` varchar(50) NOT NULL,
    `destinationChannelId` varchar(50) NOT NULL,
    `destinationChannelName` varchar(50) NOT NULL,
    `modifiedAt` timestamp DEFAULT NULL ON UPDATE current_timestamp(),
    `modifierId` varchar(50) DEFAULT NULL,
    `modifierUsername` varchar(50) DEFAULT NULL,
    `addedAt` timestamp NOT NULL DEFAULT current_timestamp(),
    `adderId` varchar(50) DEFAULT NULL,
    `adderUsername` varchar(50) DEFAULT NULL,
    PRIMARY KEY (`id`)
);