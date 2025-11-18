ALTER TABLE `darwinCache`
CHANGE COLUMN `videoUrl` `directVideoUrl` VARCHAR(255) NOT NULL;

ALTER TABLE `darwinCache`
ADD COLUMN `forumPostUrl` VARCHAR(255) NOT NULL DEFAULT '' AFTER `directVideoUrl`,
ADD COLUMN `videoTitle` VARCHAR(180) NOT NULL DEFAULT '' AFTER `videoId`;

ALTER TABLE `darwinCache`
DROP INDEX `videoUrl`;

ALTER TABLE `darwinCache`
ADD UNIQUE KEY `directVideoUrl` (`directVideoUrl`);

DESCRIBE `darwinCache`;
