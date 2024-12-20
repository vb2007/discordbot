-- discordbot.commandData definition

CREATE TABLE IF NOT EXISTS `commandData` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `name` text DEFAULT NOT NULL,
    `category` text DEFAULT NULL,
    `description` text DEFAULT NULL,
    PRIMARY KEY (`id`)
);