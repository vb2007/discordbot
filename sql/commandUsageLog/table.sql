-- discordbotTest.commandUsageLog definition

CREATE TABLE `commandUsageLog` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `commandName` tinytext DEFAULT NULL,
  `executorUserName` text DEFAULT NULL,
  `executorUserId` bigint(20) DEFAULT NULL,
  `isInServer` tinyint(1) DEFAULT NULL,
  `serverName` text DEFAULT NULL,
  `serverId` bigint(20) DEFAULT NULL,
  `channelName` text DEFAULT NULL,
  `channelId` bigint(20) DEFAULT NULL,
  `usageTime` timestamp NOT NULL DEFAULT current_timestamp(),
  `response` text DEFAULT NULL COMMENT 'Embed object that the bot sends back to the command''s executor.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX IF NOT EXISTS idx_executorUserId ON commandUsageLog(executorUserId);
CREATE INDEX IF NOT EXISTS idx_usageTime ON commandUsageLog(usageTime);