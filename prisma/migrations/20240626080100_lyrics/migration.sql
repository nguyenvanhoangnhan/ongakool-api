-- CreateTable
CREATE TABLE `lyrics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trackId` INTEGER NOT NULL,
    `content` TEXT NULL,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,

    UNIQUE INDEX `lyrics_trackId_key`(`trackId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lyrics` ADD CONSTRAINT `lyrics_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `track`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
