/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import { AlbumType } from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seedArtist() {
    const dataPath =
      '/Users/hoangnhan1203/Code/DATN/final/ongakool-be/seed_data/10kPlaylist_artistData5.json';
    /**
         * Data example
         *
        {
            "2wIVse2owClT7go1WT98tk": {
                "spotifyArtistId": "2wIVse2owClT7go1WT98tk",
                "name": "Missy Elliott",
                "avatarUrl": "https://i.scdn.co/image/ab6761610000e5ebf6691f40d906f097e9fbaa4c"
            },    
            "26dSoYclwsYLMAKD3tpOr4": {
                "spotifyArtistId": "26dSoYclwsYLMAKD3tpOr4",
                "name": "Britney Spears",
                "avatarUrl": "https://i.scdn.co/image/ab6761610000e5eb3a49b0a3954e460a8a76ed90"
            },
        } 
         * */

    let index = 0;
    const stringifiedData = fs.readFileSync(dataPath, 'utf8');
    const artistData: Record<
      string,
      {
        spotifyArtistId: string;
        name: string;
        avatarUrl: string;
      }
    > = JSON.parse(stringifiedData);
    const failedIds: string[] = [];

    // for (const [spotifyArtistId, artist] of Object.entries(artistData)) {
    //   try {
    //     await this.prisma.artist.create({
    //       data: {
    //         spotifyArtistId,
    //         name: artist.name,
    //         avatarImageUrl: artist.avatarUrl,
    //       },
    //     });
    //   } catch (error) {
    //     console.log(
    //       `Error at index ${index} with spotifyArtistId: ${spotifyArtistId}`,
    //     );

    //     failedIds.push(spotifyArtistId);
    //     console.log('error', error);
    //   }
    //   index++;

    //   if (index % 1000 === 0) {
    //     console.log(`Seeded ${index} artists`);
    //   }
    // }

    // console.log(`DONE!!! Seeded ${index} artists`);
    // console.log('Failed Ids', JSON.stringify(failedIds));

    const transaction = [];
    for (const [spotifyArtistId, artist] of Object.entries(artistData)) {
      transaction.push(
        this.prisma.artist.create({
          data: {
            spotifyArtistId,
            name: artist.name,
            avatarImageUrl: artist.avatarUrl,
          },
        }),
      );
    }

    await this.prisma.$transaction(transaction);
  }

  async seedAlbum() {
    const dataPath =
      '/Users/hoangnhan1203/Code/DATN/final/ongakool-be/seed_data/10kPlaylist_albumData2.json';
    /**
         * Data example
         *
        {
          "6vV5UrXcfyQD1wu4Qo2I9K": {
              "spotifyAlbumId": "6vV5UrXcfyQD1wu4Qo2I9K",
              "mainSpotifyArtistId": "2wIVse2owClT7go1WT98tk",
              "secondarySpotifyArtistIds": [],
              "title": "The Cookbook",
              "coverImageUrl": "https://i.scdn.co/image/ab67616d0000b273f1dfae21eaac0d24fb3dcf5a",
              "releaseDate": 20200101,
              "album_type": "album"
            },
            "0z7pVBGOD7HCIB7S8eLkLI": {
              "spotifyAlbumId": "0z7pVBGOD7HCIB7S8eLkLI",
              "mainSpotifyArtistId": "26dSoYclwsYLMAKD3tpOr4",
              "secondarySpotifyArtistIds": [],
              "title": "In The Zone",
              "coverImageUrl": "https://i.scdn.co/image/ab67616d0000b273efc6988972cb04105f002cd4",
              "releaseDate": 19601212,
              "album_type": "album"
            },
        } 
      * */

    let index = 0;
    const stringifiedData = fs.readFileSync(dataPath, 'utf8');
    const albumData: Record<
      string,
      {
        spotifyAlbumId: string;
        mainSpotifyArtistId: string;
        secondarySpotifyArtistIds: string[];
        title: string;
        coverImageUrl: string;
        releaseDate: number;
        album_type: string;
      }
    > = JSON.parse(stringifiedData);
    const failedIds: string[] = [];

    // for (const [spotifyAlbumId, album] of Object.entries(albumData)) {
    //   try {
    //     await this.prisma.album.create({
    //       data: {
    //         spotifyAlbumId,
    //         title: album.title,
    //         coverImageUrl: album.coverImageUrl,
    //         releasedAt: album.releaseDate,
    //         albumType: album.album_type as AlbumType,
    //         artist: {
    //           connect: {
    //             spotifyArtistId: album.mainSpotifyArtistId,
    //           },
    //         },
    //       },
    //     });
    //   } catch (error) {
    //     console.log(
    //       `Error at index ${index} with spotifyAlbumId: ${spotifyAlbumId}`,
    //     );

    //     failedIds.push(spotifyAlbumId);
    //     console.log('error', error);
    //   }

    //   index++;

    //   if (index % 5000 === 0) {
    //     console.log(`Seeded ${index} albums`);
    //   }
    // }

    const transaction = [];
    for (const [spotifyAlbumId, album] of Object.entries(albumData)) {
      transaction.push(
        this.prisma.album.create({
          data: {
            spotifyAlbumId,
            title: album.title,
            coverImageUrl: album.coverImageUrl,
            releasedAt: album.releaseDate,
            albumType: album.album_type as AlbumType,
            artist: {
              connect: {
                spotifyArtistId: album.mainSpotifyArtistId,
              },
            },
          },
        }),
      );
    }

    await this.prisma.$transaction(transaction);

    // console.log(`DONE!!! Seeded ${index} albums`);
    // console.log('Failed Ids', JSON.stringify(failedIds));
  }

  async seedTrack() {
    const dataPath =
      '/Users/hoangnhan1203/Code/DATN/final/ongakool-be/seed_data/10kPlaylist_trackData2.json';

    let index = 0;

    /**
     * 
     * Data example
    {
        "0UaMYEvWZi0ZqiDOoHU3YI": {
          "spotifyTrackId": "0UaMYEvWZi0ZqiDOoHU3YI",
          "title": "Lose Control (feat. Ciara & Fat Man Scoop)",
          "artistNames": "Missy Elliott,Ciara,Fatman Scoop",
          "spotifyAlbumId": "6vV5UrXcfyQD1wu4Qo2I9K",
          "spotifyMainArtistId": "2wIVse2owClT7go1WT98tk",
          "spotifySecondaryArtistIds": [
            "2NdeV5rLm47xAvogXrYhJX",
            "15GGbJKqC6w0VYyAJtjej6"
          ],
          "durationMs": 226863,
          "track_number": 4,
          "disc_number": 1,
          "previewUrl": "https://p.scdn.co/mp3-preview/253a76c453026570394aa26156691d1d81b387c0?cid=9782dc6ae1554dd3a7fb7d5411b1446d",
          "secondTrackIds": null
        },
        "6I9VzXrHxO9rA9A5euc8Ak": {
          "spotifyTrackId": "6I9VzXrHxO9rA9A5euc8Ak",
          "title": "Toxic",
          "artistNames": "Britney Spears",
          "spotifyAlbumId": "0z7pVBGOD7HCIB7S8eLkLI",
          "spotifyMainArtistId": "26dSoYclwsYLMAKD3tpOr4",
          "spotifySecondaryArtistIds": [],
          "durationMs": 198800,
          "track_number": 6,
          "disc_number": 1,
          "previewUrl": "https://p.scdn.co/mp3-preview/6de2791f84c1d637a0e24734b6df3997cc742da4?cid=9782dc6ae1554dd3a7fb7d5411b1446d",
          "secondTrackIds": null
        },
  }
     */

    const stringifiedData = fs.readFileSync(dataPath, 'utf8');
    const trackData: Record<
      string,
      {
        spotifyTrackId: string;
        title: string;
        artistNames: string;
        spotifyAlbumId: string;
        spotifyMainArtistId: string;
        spotifySecondaryArtistIds: string[];
        durationMs: number;
        track_number: number;
        disc_number: number;
        previewUrl: string;
        secondTrackIds: string;
      }
    > = JSON.parse(stringifiedData);

    const failedIds: string[] = [];

    for (const [spotifyTrackId, track] of Object.entries(trackData)) {
      try {
        const newTrack = await this.prisma.track.create({
          data: {
            title: track.title,
            artistNames: track.artistNames,
            spotifyTrackId,
            durationMs: track.durationMs,
            trackNumber: track.track_number,
            discNumber: track.disc_number,
            previewAudioUrl: track.previewUrl,
            album: {
              connect: {
                spotifyAlbumId: track.spotifyAlbumId,
              },
            },
            mainArtist: {
              connect: {
                spotifyArtistId: track.spotifyMainArtistId,
              },
            },
          },
        });

        if (track.spotifySecondaryArtistIds?.length > 0) {
          for (const secondaryArtistId of track.spotifySecondaryArtistIds) {
            await this.prisma.secondary_artist_track_link.create({
              data: {
                track: {
                  connect: {
                    id: newTrack.id,
                  },
                },
                artist: {
                  connect: {
                    spotifyArtistId: secondaryArtistId,
                  },
                },
                createdAt: moment().unix(),
              },
            });
          }
        }
        if (track.secondTrackIds) {
          await this.prisma.track_spotifySecondTrackId_link.create({
            data: {
              trackId: newTrack.id,
              spotifySecondTrackId: track.secondTrackIds,
            },
          });
        }
      } catch (error) {
        console.log(
          `Error at index ${index} with spotifyTrackId: ${spotifyTrackId}`,
        );

        failedIds.push(spotifyTrackId);
        console.log('error', error);
      }

      index++;

      if (index % 5000 === 0) {
        console.log(`Seeded ${index} tracks`);
      }
    }
  }

  async seedTrackPopularity() {
    // read data from 'seed_data/10kPlaylist_trackPopularity_map.json'
    // it's a map of trackId (key) -> popularity (value)
    const dataPath =
      '/Users/hoangnhan1203/Code/DATN/final/ongakool-be/seed_data/100kPlaylist_popularity_000.json';

    const stringifiedData = fs.readFileSync(dataPath, 'utf8');
    const trackPopularityMap: Record<string, number> =
      JSON.parse(stringifiedData);

    for (const [trackId, popularity] of Object.entries(trackPopularityMap)) {
      await this.prisma.track.update({
        where: {
          id: +trackId,
        },
        data: {
          temp_popularity: popularity,
        },
      });
    }
  }

  async chore() {
    const allTracks = await this.prisma.track.findMany({
      select: {
        id: true,
        spotifyTrackId: true,
        track_spotifySecondTrackId_link: true,
      },
    });

    // write spotifyTrackIds to 'exported_data/spotifyTrackIds.json'

    const spotifyTrackIds = allTracks.map((track) => ({
      id: track.id,
      spotifyTrackId: track.spotifyTrackId,
      secondTrackIds:
        track.track_spotifySecondTrackId_link?.[0]?.spotifySecondTrackId ??
        null,
    }));

    fs.writeFileSync(
      '/Users/hoangnhan1203/Code/DATN/final/ongakool-be/exported_data/spotifyTrackIds.json',
      JSON.stringify(spotifyTrackIds, null, 2),
    );
  }
}
