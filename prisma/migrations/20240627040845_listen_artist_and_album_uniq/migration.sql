/*
  Warnings:

  - A unique constraint covering the columns `[userId,albumId]` on the table `user_listen_album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,artistId]` on the table `user_listen_artist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_listen_album_userId_albumId_key` ON `user_listen_album`(`userId`, `albumId`);

-- CreateIndex
CREATE UNIQUE INDEX `user_listen_artist_userId_artistId_key` ON `user_listen_artist`(`userId`, `artistId`);
