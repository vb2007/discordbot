CREATE TABLE IF NOT EXISTS `autorole` (
    `guildId` VARCHAR(18) NOT NULL,
    `roleId` TEXT NOT NULL,
    `addedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `adderId` TEXT,
    `adderUsername` TEXT,
    PRIMARY KEY (`guildId`)
);