import { ToggleLikeTrackDto } from './dto/toggleLikeTrack.dto';
import { Injectable } from '@nestjs/common';
// import { CreateTrackDto } from './dto/create-track.dto';
// import { UpdateTrackDto } from './dto/update-track.dto';
import { AuthData } from 'src/auth/decorator/get-auth-data.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { FindManyTrackQueryDto } from './dto/findManyTrack.dto';
import { isNil } from 'lodash';
import { Track, TrackWithForeign } from './entities/track.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SearchTrack } from './dto/searchTrackByLyrics-query.dto';
import { writeFileSync } from 'fs';
import { GetUnixNow } from 'src/util/common.util';

@Injectable()
export class TrackService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.prisma.track
      .findMany({
        where: {
          id: {
            in: [
              456, 461, 473, 4658, 6751, 6752, 6866, 10553, 10870, 22137, 46883,
              47732, 76, 1636, 3296, 2134, 4443, 7609, 11473, 23681, 59457, 65,
              79, 8188, 31437, 31439, 33901, 4655, 10664, 28940, 15530, 1065,
              328, 2368, 2122, 4065, 8860, 1734, 3930, 15487, 16932, 8964, 2132,
              4408, 347, 4601, 4600, 4602, 37009,
            ],
          },
        },
        select: {
          id: true,
          spotifyTrackId: true,
          title: true,
          audio: {
            select: {
              fullUrl: true,
            },
          },
        },
      })
      .then((data) => {
        writeFileSync(
          'exported_data/test_tracks.json',
          JSON.stringify(data, null, 2),
        );
      });
  }

  // create(createTrackDto: CreateTrackDto) {
  //   console.log(createTrackDto);
  //   return 'This action adds a new track';
  // }

  async findAll() {
    const tracks = await this.prisma.track.findMany({});

    return PlainToInstanceList(Track, tracks);
  }

  async getById(id: number, authData?: AuthData) {
    const track = await this.prisma.track.findFirst({
      where: {
        id,
      },
      include: {
        album: true,
        audio: true,
        mainArtist: true,
        lyrics: true,
        secondary_artist_track_links: {
          include: {
            artist: true,
          },
        },
        user_favourite_tracks: authData
          ? {
              where: {
                userId: authData.id,
              },
            }
          : undefined,
      },
    });

    const isFavourite = track?.user_favourite_tracks?.length > 0 ? 1 : 0;

    return PlainToInstance(TrackWithForeign, {
      ...track,
      isFavourite,
      audio: track.audio ? track.audio : { fullUrl: track.previewAudioUrl },
    });
  }

  // update(id: number, updateTrackDto: UpdateTrackDto) {
  //   console.log(updateTrackDto);
  //   return `This action updates a #${id} track`;
  // }

  remove(id: number) {
    return `This action removes a #${id} track`;
  }

  async getMany(filter: FindManyTrackQueryDto, authData?: AuthData) {
    const tracks = await this.prisma.track.findMany({
      where: {
        id: filter.ids ? { in: filter.ids } : undefined,
        spotifyTrackId: filter.spotifyIds
          ? { in: filter.spotifyIds }
          : undefined,
        OR: [
          {
            mainArtist:
              !isNil(filter.artistId) || !isNil(filter.spotifyArtistId)
                ? {
                    id: !isNil(filter.artistId) ? +filter.artistId : undefined,
                    spotifyArtistId: !isNil(filter.spotifyArtistId)
                      ? filter.spotifyArtistId
                      : undefined,
                  }
                : undefined,
          },
          {
            secondary_artist_track_links:
              !isNil(filter.artistId) || !isNil(filter.spotifyArtistId)
                ? {
                    some: {
                      artist: {
                        id: !isNil(filter.artistId)
                          ? +filter.artistId
                          : undefined,
                        spotifyArtistId: !isNil(filter.spotifyArtistId)
                          ? filter.spotifyArtistId
                          : undefined,
                      },
                    },
                  }
                : undefined,
          },
        ],
        albumId: filter.albumId ? filter.albumId : undefined,
        playlist_track_links: filter.playlistId
          ? {
              some: {
                playlistId: filter.playlistId,
              },
            }
          : undefined,
      },
      include: {
        album: true,
        mainArtist: true,
        audio: true,
        secondary_artist_track_links: {
          include: {
            artist: true,
          },
        },
        user_favourite_tracks: authData
          ? {
              where: {
                userId: authData.id,
              },
            }
          : undefined,
      },
      orderBy: {
        temp_popularity: 'desc',
      },
      skip: filter.page ? (+filter.page - 1) * +filter.pageSize : undefined,
      take: +filter.pageSize,
    });

    console.log({
      skip: filter.page ? (+filter.page - 1) * +filter.pageSize : undefined,
      take: +filter.pageSize,
    });

    const editedTracks = tracks.map((track) => {
      return {
        ...track,
        isFavourite: track.user_favourite_tracks?.length > 0 ? 1 : 0,
        audio: track.audio ? track.audio : { fullUrl: track.previewAudioUrl },
      };
    });

    return PlainToInstanceList(TrackWithForeign, editedTracks);
  }

  async getRecentListenTracks(authData: AuthData) {
    const recentTracks = await this.prisma.user_listen_track.findMany({
      where: {
        userId: authData.id,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        track: {
          include: {
            album: true,
            mainArtist: true,
          },
        },
      },
      take: 20,
    });

    return PlainToInstanceList(
      TrackWithForeign,
      recentTracks.map((i) => i.track),
    );
  }

  async toggleLikeTrack(dto: ToggleLikeTrackDto, authData: AuthData) {
    const { toggleOn, trackId } = dto;
    await this.prisma.track.findFirstOrThrow({
      where: { id: +dto.trackId },
    });

    const like = await this.prisma.user_favourite_track.findFirst({
      where: {
        trackId,
        userId: authData.id,
      },
    });

    if (toggleOn === 1 && !like) {
      await this.prisma.user_favourite_track.create({
        data: {
          trackId,
          userId: authData.id,
        },
      });
    } else if (!(toggleOn === 0) && like) {
      await this.prisma.user_favourite_track.delete({
        where: {
          id: like.id,
        },
      });
    }

    return true;
  }

  async listenTrack(trackId: number, authData: AuthData) {
    const track = await this.prisma.track.findFirst({
      where: {
        id: trackId,
      },
    });

    this.prisma.user_listen_artist.upsert({
      where: {
        user_listen_artist_userId_artistId_unique: {
          userId: authData.id,
          artistId: track.mainArtistId,
        },
      },
      update: {
        updatedAt: GetUnixNow(),
        listenCount: {
          increment: 1,
        },
      },
      create: {
        userId: authData.id,
        artistId: track.mainArtistId,
        listenCount: 1,
        updatedAt: GetUnixNow(),
        createdAt: GetUnixNow(),
      },
    });

    if (track.albumId) {
      this.prisma.user_listen_album.upsert({
        where: {
          user_listen_album_userId_albumId_unique: {
            userId: authData.id,
            albumId: track.albumId,
          },
        },
        update: {
          updatedAt: GetUnixNow(),
        },
        create: {
          userId: authData.id,
          albumId: track.albumId,
          updatedAt: GetUnixNow(),
          createdAt: GetUnixNow(),
        },
      });
    }

    return this.prisma.user_listen_track.upsert({
      where: {
        user_listen_track_userId_trackId_unique: {
          userId: authData.id,
          trackId,
        },
      },
      update: {
        updatedAt: GetUnixNow(),
        listenCount: {
          increment: 1,
        },
      },
      create: {
        userId: authData.id,
        trackId,
        listenCount: 1,
        updatedAt: GetUnixNow(),
        createdAt: GetUnixNow(),
      },
    });
  }

  async searchTrackByTitle(query: SearchTrack) {
    const searchText = query.text.trim().toLowerCase();

    const tracks = await this.prisma.track.findMany({
      where: {
        title: {
          contains: searchText,
        },
      },
      orderBy: {
        temp_popularity: 'desc',
      },
      take: query.limit ?? 20,
      include: {
        mainArtist: true,
        album: true,
      },
    });

    return PlainToInstanceList(Track, tracks);
  }

  async external_searchTrackByLyrics(query: SearchTrack) {
    const apiUrl =
      this.config.get('externalApi.searchByLyrics.baseUrl') +
      'search-track-by-lyrics';

    const queryParamsStr = new URLSearchParams({
      query: query.text,
      limit: query.limit.toString(),
    }).toString();

    const result = await axios
      .get<{
        result: string[];
      }>(`${apiUrl}?${queryParamsStr}`)
      .then((res) => res.data.result);

    // each string in result will be look like this:
    // '4CeeEOM32jQcH3eN9Q2dGj->Nirvana - Smells Like Teen Spirit'
    const resultSpotifyTrackIds = result.map((i) => i.split('->')[0]);

    const tracks = await this.prisma.track.findMany({
      where: {
        spotifyTrackId: {
          in: resultSpotifyTrackIds,
        },
      },
      include: {
        mainArtist: true,
      },
      // orderBy: {
      //   temp_popularity: 'desc',
      // },
    });

    // sort result by resultPopularityTrackIds
    const resultSortedByExternalResult = resultSpotifyTrackIds.map((id) =>
      tracks.find((i) => i.spotifyTrackId === id),
    );

    console.log(`:::QUERY::: limit ${query.limit}  text: "${query.text}"`);
    console.table(
      tracks.map((item) => ({
        id: item.id,
        title: item.title,
        artistNames: item.mainArtist.name,
        popularity: item.temp_popularity,
      })),
    );

    return PlainToInstanceList(Track, resultSortedByExternalResult);
  }

  async chore_countLeastPopularTracks(lessThanOrEqual: number = 10) {
    const count = await this.prisma.track.count({
      where: {
        temp_popularity: {
          lte: lessThanOrEqual,
        },
      },
    });

    // find and write to exported_data/least_popular_tracks_${lessThanOrEqual}.json
    const tracks = (
      await this.prisma.track.findMany({
        where: {
          temp_popularity: {
            lte: lessThanOrEqual,
          },
        },
      })
    ).map((i) => i.spotifyTrackId);

    writeFileSync(
      `exported_data/least_popular_tracks_${lessThanOrEqual}.json`,
      JSON.stringify(tracks, null, 2),
    );

    return count;
  }

  async external_getRecommendBasedOnRecentlyListening(
    userId: number,
  ): Promise<Track[]> {
    const now = GetUnixNow();
    const _1hrsAgo = now - 60 * 60;

    const cacheRecommendation =
      await this.prisma.recent_listening_based_recommendation.findFirst({
        where: {
          userId,
        },
      });

    if (cacheRecommendation && cacheRecommendation?.updatedAt > _1hrsAgo) {
      const trackIds = cacheRecommendation.trackIds
        .split(',')
        .map((idStr) => +idStr);

      const tracks = await this.prisma.track.findMany({
        where: {
          id: {
            in: trackIds,
          },
        },
        include: {
          album: true,
          mainArtist: true,
        },
      });

      return PlainToInstanceList(TrackWithForeign, tracks);
    }

    console.log('======== FOUND NO CACHE RECOMMENDATION ============');

    const recentlyListen = await this.prisma.user_listen_track.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        track: {
          include: {
            track_spotifySecondTrackId_link: true,
          },
        },
      },
      take: 20,
    });

    if (recentlyListen.length === 0) {
      return await this.getMostPopularTracks();
    }

    console.log('========RECENTLY LISTEN SONG============');
    console.table(
      recentlyListen.map((item) => ({
        name: item.track.title,
        artistNames: item.track.artistNames,
      })),
    );
    console.log('========================================');

    const spotifyTrackIdsInPlaylist = recentlyListen.reduce<string[]>(
      (acc, cur) => {
        acc.push(cur.track.spotifyTrackId);
        if (cur.track?.track_spotifySecondTrackId_link?.length > 0) {
          acc.push(
            cur.track.track_spotifySecondTrackId_link?.[0].spotifySecondTrackId,
          );
        }
        return acc;
      },
      [],
    );

    const apiUrl =
      this.config.get('externalApi.recommendation.baseUrl') +
      'recommend-similar-tracks';
    const recommendationResult = await axios
      .post<{
        result: string;
      }>(apiUrl, {
        trackIds: spotifyTrackIdsInPlaylist,
      })
      .then((res) => res.data.result);

    console.log('result: ', recommendationResult);

    if (!recommendationResult?.length) {
      console.log('Recommendation result is empty');
      return await this.getMostPopularTracks();
    }

    const recommendationSpotifyTrackIds = recommendationResult.split(',');

    const recommendationTracks = await this.prisma.track.findMany({
      where: {
        AND: [
          {
            OR: [
              // Condition 1: Track's spotify id is in recommendation list
              {
                spotifyTrackId: {
                  in: recommendationSpotifyTrackIds,
                },
              },
              // Condition 2: Track's second spotify id is in recommendation list
              {
                track_spotifySecondTrackId_link: {
                  some: {
                    spotifySecondTrackId: {
                      in: recommendationSpotifyTrackIds,
                    },
                  },
                },
              },
            ],
          },
          {
            OR: [
              {
                audioId: {
                  not: null,
                },
              },
              {
                previewAudioUrl: {
                  not: null,
                },
              },
            ],
          },
        ],
      },
      include: {
        track_spotifySecondTrackId_link: true,
        album: true,
      },
    });
    console.log('Recommendation Tracks:');
    console.table(
      recommendationTracks.map((item) => ({
        id: item.id,
        name: item.title,
        artistNames: item.artistNames,
      })),
    );

    const recommendationTrackIds = recommendationTracks.map((i) => i.id);
    if (
      recommendationTrackIds.length > 0 &&
      (!cacheRecommendation || cacheRecommendation?.updatedAt > _1hrsAgo)
    ) {
      await this.prisma.recent_listening_based_recommendation.upsert({
        where: {
          userId,
        },
        update: {
          trackIds: recommendationTrackIds.join(','),
          updatedAt: now,
        },
        create: {
          userId,
          trackIds: recommendationTrackIds.join(','),
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return PlainToInstanceList(TrackWithForeign, recommendationTracks);
  }

  async getMostPopularTracks(limit: number = 20) {
    const tracks = await this.prisma.track.findMany({
      where: {
        OR: [
          {
            audioId: {
              not: null,
            },
          },
          {
            previewAudioUrl: {
              not: null,
            },
          },
        ],
      },
      orderBy: {
        temp_popularity: 'desc',
      },
      take: limit,
      include: {
        mainArtist: true,
        album: true,
      },
    });

    return PlainToInstanceList(TrackWithForeign, tracks);
  }
}
