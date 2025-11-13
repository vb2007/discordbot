-- discordbot.darwinCache definition

CREATE TABLE IF NOT EXISTS `darwinCache` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `originalFileUrl` VARCHAR(255) NOT NULL,
    `forumPostUrl` VARCHAR(255) NOT NULL,
    `videoId` VARCHAR(100) NOT NULL,
    `videoTitle` VARCHAR(180) NOT NULL,
    `originalFileSize` DECIMAL NOT NULL,
    `processedFileSize` DECIMAL DEFAULT NULL,
    `processedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (`videoUrl`),
    UNIQUE KEY (`videoId`)
);
