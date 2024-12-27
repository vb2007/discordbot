-- discordbot.commandData definition

CREATE TABLE IF NOT EXISTS `commandData` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `category` text DEFAULT NULL,
    `description` text DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_name` (`name`)
);