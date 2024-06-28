import { UpdatePlaylistDto } from './dto/updatePlaylist.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { Playlist, PlaylistWithForeign } from './entities/playlist.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthData } from 'src/auth/decorator/get-auth-data.decorator';
import {
  Track,
  TrackWithForeign,
} from 'src/music-modules/track/entities/track.entity';
import { GetUnixNow } from 'src/util/common.util';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/s3/s3.service';

// import { UpdatePlaylistDto } from './dto/update-playlist.dto';
@Injectable()
export class PlaylistService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private s3: S3Service,
  ) {}

  async create(authData: AuthData) {
    const createdCount = await this.prisma.playlist.count({
      where: { ownerUserId: authData.id },
    });

    const newPlaylist = await this.prisma.playlist.create({
      data: {
        coverImageUrl:
          'https://ongakool.s3.ap-southeast-1.amazonaws.com/assets/default-playlist-cover.jpeg',
        name: `Playlist ${createdCount + 1}`,
        ownerUser: {
          connect: {
            id: authData.id,
          },
        },
      },
    });

    return PlainToInstance(Playlist, newPlaylist);
  }

  findAll() {
    return `This action returns all playlist`;
  }

  async update(id: number, dto: UpdatePlaylistDto, authData: AuthData) {
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id,
      },
    });

    if (!playlist) throw new NotFoundException('Playlist not found');

    if (playlist.ownerUserId !== authData.id) {
      throw new ForbiddenException('Only owner can update playlist');
    }

    await this.prisma.playlist.update({
      where: {
        id,
      },
      data: {
        name: !dto.name || dto.name.trim() === '' ? undefined : dto.name,
        description:
          !dto.description || dto.description.trim() === ''
            ? undefined
            : dto.description,
      },
    });
  }

  async setCover(
    playlistId: number,
    file: Express.Multer.File,
    authData: AuthData,
  ) {
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.ownerUserId !== authData.id) {
      throw new UnauthorizedException('You are not the owner of this playlist');
    }

    const { fullUrl } = await this.s3.uploadFile({
      fileBody: file.buffer,
      directory: 'playlist-cover',
      fileName: `cover_${playlistId}_${uuidv4()}${path.extname(file.originalname)}`,
    });

    if (!fullUrl) throw new BadRequestException('Failed to upload image');

    await this.prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        coverImageUrl: fullUrl,
      },
    });

    return fullUrl;
  }

  async findOne(id: number) {
    const playlist = await this.prisma.playlist.findFirstOrThrow({
      where: { id },
    });

    return PlainToInstance(Playlist, playlist);
  }

  async getById(id: number, authData: AuthData) {
    if (id === -1) {
      return this.getLikedSongsAsPlaylist(authData);
    }

    const playlist = await this.prisma.playlist.findFirstOrThrow({
      where: { id },
      include: {
        ownerUser: true,
        playlist_track_links: {
          include: {
            track: { include: { album: true, audio: true, mainArtist: true } },
          },
        },
      },
    });

    return PlainToInstance(PlaylistWithForeign, playlist);
  }

  async getLikedSongsAsPlaylist(authData: AuthData) {
    const likedSongs = await this.prisma.user_favourite_track.findMany({
      where: {
        userId: authData.id,
      },
      include: {
        track: {
          include: {
            album: true,
          },
        },
      },
    });

    const playlist = {
      id: -1,
      name: 'Liked Songs',
      coverImageUrl:
        'https://ongakool.s3.ap-southeast-1.amazonaws.com/assets/liked-songs.jpg',
      ownerUserId: authData.id,
      _count: {
        playlist_track_links: likedSongs.length,
      },
      createdAt: 0,
      updatedAt: 0,
      description: 'Liked Songs',
      isLikedSongList: 1,
      playlist_track_links: likedSongs.map((i, index) => ({
        id: index,
        track: i.track,
      })),
    };

    return PlainToInstance(PlaylistWithForeign, playlist);
  }

  async getMyPlaylists(authData: AuthData) {
    const playlists = await this.prisma.playlist.findMany({
      where: {
        ownerUserId: authData.id,
      },
      include: {
        _count: {
          select: {
            playlist_track_links: true,
          },
        },
      },
    });

    const likedSongs = await this.prisma.user_favourite_track.findMany({
      where: {
        userId: authData.id,
      },
    });

    const playlistForLikedSongs: typeof playlists extends Array<infer T>
      ? T & { isLikedSongList: number }
      : never = {
      id: -1,
      name: 'Liked Songs',
      ownerUserId: authData.id,
      coverImageUrl:
        'https://ongakool.s3.ap-southeast-1.amazonaws.com/assets/liked-songs.jpg',
      _count: {
        playlist_track_links: likedSongs.length,
      },
      createdAt: 0,
      updatedAt: 0,
      description: 'Liked Songs',
      isLikedSongList: 1,
    };

    return PlainToInstanceList(Playlist, [
      playlistForLikedSongs,
      ...playlists.map((playlist) => ({
        ...playlist,
        isLikedSongList: 0,
      })),
    ]);
  }

  async addTrackToPlaylist(
    playlistId: number,
    trackId: number,
    authData: AuthData,
  ) {
    await this.prisma.track.findFirstOrThrow({
      where: { id: +trackId },
    });

    const playlist = await this.prisma.playlist.findFirstOrThrow({
      where: { id: +playlistId },
      include: {
        playlist_track_links: {
          select: {
            no: true,
            trackId: true,
          },
        },
      },
    });

    if (playlist.ownerUserId !== authData.id) {
      throw new UnauthorizedException('You are not the owner of this playlist');
    }

    if (
      playlist.playlist_track_links.findIndex((i) => i.trackId === trackId) !==
      -1
    ) {
      throw new BadRequestException('This track is already in this playlist');
    }

    const highestNo = playlist.playlist_track_links.reduce(
      (acc, cur) => (cur.no > acc ? cur.no : acc),
      0,
    );

    await this.prisma.playlist.update({
      where: { id: +playlistId },
      data: {
        playlist_track_links: {
          create: {
            trackId: +trackId,
            createdAt: GetUnixNow(),
            no: highestNo,
          },
        },
      },
    });
  }

  async removeTrackFromPlaylist(
    playlistId: number,
    trackId: number,
    authData: AuthData,
  ) {
    await this.prisma.track.findFirstOrThrow({
      where: { id: trackId },
    });

    const playlist = await this.prisma.playlist.findFirstOrThrow({
      where: { id: playlistId },
      include: {
        playlist_track_links: true,
      },
    });

    if (playlist.ownerUserId !== authData.id) {
      throw new UnauthorizedException('You are not the owner of this playlist');
    }
    if (
      playlist.playlist_track_links.findIndex((i) => i.trackId === trackId) ===
      -1
    ) {
      throw new BadRequestException('This track is not in this playlist');
    }

    await this.prisma.playlist_track_link.deleteMany({
      where: {
        playlistId: playlistId,
        trackId: trackId,
      },
    });
  }

  // update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
  //   return `This action updates a #${id} playlist`;
  // }
  remove(id: number) {
    return `This action removes a #${id} playlist`;
  }

  // Return a list of recommendation track ids
  async external_getRecommendationTracksForPlaylist(
    playlistId: number,
  ): Promise<Track[]> {
    const trackInPlaylist = await this.prisma.playlist_track_link.findMany({
      where: {
        playlistId: playlistId,
      },
      include: {
        track: {
          select: {
            spotifyTrackId: true,
            track_spotifySecondTrackId_link: true,
            // FOR LOGGING
            title: true,
            artistNames: true,
          },
        },
      },
    });

    if (trackInPlaylist.length === 0) {
      throw new BadRequestException('Playlist is empty');
    }

    console.log('========SONG IN PLAYLIST============');
    console.table(
      trackInPlaylist.map((item) => ({
        name: item.track.title,
        artistNames: item.track.artistNames,
      })),
    );

    const spotifyTrackIdsInPlaylist = trackInPlaylist.reduce<string[]>(
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

    // console.log('send these ids to recommendation api: ')
    // console.table(spotifyTrackIdsInPlaylist);

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

    // console.log('result: ', recommendationResult);

    if (!recommendationResult?.length) {
      throw new BadRequestException('No recommendation tracks found');
    }

    const recommendationSpotifyTrackIds = recommendationResult.split(',');

    const recommendationTracks = await this.prisma.track.findMany({
      where: {
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

    return PlainToInstanceList(TrackWithForeign, recommendationTracks);
  }
}
