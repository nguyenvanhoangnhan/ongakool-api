-- AlterTable
ALTER TABLE `album` ADD COLUMN `temp_popularity` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `artist` ADD COLUMN `temp_popularity` INTEGER NULL DEFAULT 0;
