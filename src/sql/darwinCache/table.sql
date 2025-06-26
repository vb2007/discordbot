-- discordbot.darwinCache definition

CREATE TABLE IF NOT EXISTS `darwinCache` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `videoUrl` VARCHAR(255) NOT NULL,
    `videoId` VARCHAR(100) NOT NULL,
    `processedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (`videoUrl`),
    UNIQUE KEY (`videoId`)
);