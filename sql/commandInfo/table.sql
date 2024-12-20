-- discordbot.commandData definition

CREATE TABLE IF NOT EXISTS `commandData` (
    `id` varchar(50) NOT NULL,
    `name` text DEFAULT NOT NULL,
    `category` text DEFAULT NULL,
    `description` text DEFAULT NULL,
    PRIMARY KEY (`id`)
);