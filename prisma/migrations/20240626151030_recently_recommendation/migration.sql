-- CreateTable
CREATE TABLE `recent_listening_based_recommendation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `trackIds` TEXT NOT NULL,
    `createdAt` INTEGER NULL,
    `updatedAt` INTEGER NULL,

    UNIQUE INDEX `recent_listening_based_recommendation_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recent_listening_based_recommendation` ADD CONSTRAINT `recent_listening_based_recommendation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
