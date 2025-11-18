-- discordbot.darwinCache definition

CREATE TABLE IF NOT EXISTS `darwinCache` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `directVideoUrl` VARCHAR(255) NOT NULL,
    `forumPostUrl` VARCHAR(255) NOT NULL,
    `videoId` VARCHAR(100) NOT NULL,
    `videoTitle` VARCHAR(180) NOT NULL,
    `processedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (`directVideoUrl`),
    UNIQUE KEY (`videoId`)
);
