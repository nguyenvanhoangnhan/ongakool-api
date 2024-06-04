export class Artist {
  // id              Int     @id @default(autoincrement())
  // spotifyArtistId String? @unique @db.VarChar(22)
  // name         String?
  // introduction String?
  // userId       Int  @unique
  // coverImageId Int?
  // createdAt Int?
  // updatedAt Int?
  // user                           user                             @relation(fields: [userId], references: [id])
  // coverImage                     image?                           @relation(fields: [coverImageId], references: [id])
  // album                          album[]
  // artist_introduction_image_link artist_introduction_image_link[]
  // secondary_artist_track_link    secondary_artist_track_link[]
  // track                          track[]
}
