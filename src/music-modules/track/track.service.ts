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
import moment from 'moment';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SearchTrack } from './dto/searchTrackByLyrics-query.dto';
import { writeFileSync } from 'fs';

@Injectable()
export class TrackService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

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
                    id: !isNil(filter.artistId) ? filter.artistId : undefined,
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
                          ? filter.artistId
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
        track: true,
      },
      take: 20,
    });

    return PlainToInstanceList(
      Track,
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
    return this.prisma.user_listen_track.upsert({
      where: {
        user_listen_track_userId_trackId_unique: {
          userId: authData.id,
          trackId,
        },
      },
      update: {
        updatedAt: moment().unix(),
        listenCount: {
          increment: 1,
        },
      },
      create: {
        userId: authData.id,
        trackId,
        listenCount: 1,
        updatedAt: moment().unix(),
        createdAt: moment().unix(),
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
}
