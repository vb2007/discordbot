-- discordbotTest.economyInventory definition

CREATE TABLE IF NOT EXISTS `economyInventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `itemId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userItem` (`userId`,`itemId`),
  KEY `fk_inventory_item` (`itemId`),
  CONSTRAINT `fk_inventory_item` FOREIGN KEY (`itemId`) REFERENCES `economyStore` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_user` FOREIGN KEY (`userId`) REFERENCES `economy` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
