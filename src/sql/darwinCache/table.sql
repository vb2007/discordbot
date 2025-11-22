-- discordbot.darwinCache definition

CREATE TABLE IF NOT EXISTS `darwinCache` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `directVideoUrl` varchar(255) NOT NULL,
  `forumPostUrl` varchar(255) NOT NULL DEFAULT '',
  `videoId` varchar(100) NOT NULL,
  `videoTitle` varchar(180) NOT NULL DEFAULT '',
  `processedAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `videoId` (`videoId`),
  UNIQUE KEY `directVideoUrl` (`directVideoUrl`)
);
