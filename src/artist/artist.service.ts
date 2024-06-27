import { Artist, ArtistWithForeign } from './entities/artist.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
// import { CreateArtistDto } from './dto/create-artist.dto';
// import { UpdateArtistDto } from './dto/update-artist.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { FindManyArtistQueryDto } from './dto/findManyArtist.dto';
import { SearchArtistNameQueryDto } from './dto/searchArtistName.dto';
import { AuthData } from 'src/auth/decorator/get-auth-data.decorator';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ArtistService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // TODO
  // create(createArtistDto: CreateArtistDto) {
  // return 'This action adds a new artist';
  // }

  async findAll() {
    const artists = await this.prisma.artist.findMany();

    return PlainToInstanceList(Artist, artists);
  }

  async findMany(filter: FindManyArtistQueryDto) {
    const artists = await this.prisma.artist.findMany({
      where: {
        id: filter.ids ? { in: filter.ids } : undefined,
        spotifyArtistId: filter.spotifyIds
          ? { in: filter.spotifyIds }
          : undefined,
      },
    });

    return PlainToInstanceList(Artist, artists);
  }

  async searchArtistName(filter: SearchArtistNameQueryDto) {
    const artists = await this.prisma.artist.findMany({
      where: {
        name: { contains: filter.searchText.trim() },
      },
    });

    return PlainToInstanceList(Artist, artists);
  }

  async findOne(id: number) {
    const artist = await this.prisma.artist.findFirstOrThrow({
      where: { id },
    });

    return PlainToInstance(Artist, artist);
  }

  async findOne_WithAlbums(id: number) {
    const artist = await this.prisma.artist.findFirstOrThrow({
      where: { id },
      include: { albums: true },
    });

    return PlainToInstance(ArtistWithForeign, artist);
  }

  async findOne_WithTracks(id: number) {
    const artist = await this.prisma.artist.findFirstOrThrow({
      where: { id },
      include: { tracks: true },
    });

    return PlainToInstance(ArtistWithForeign, artist);
  }

  async findOne_WithAllForeign(id: number) {
    const artist = await this.prisma.artist.findFirstOrThrow({
      where: { id },
      include: {
        albums: {
          include: { tracks: true },
          orderBy: {
            releasedAt: 'desc',
          },
        },
        tracks: {
          orderBy: { listenCount: 'desc' },
        },
      },
    });

    return PlainToInstance(ArtistWithForeign, artist);
  }

  async getRecentListenArtist(authData: AuthData) {
    const recentArtists = await this.prisma.user_listen_artist.findMany({
      where: {
        userId: authData.id,
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        artist: true,
      },
    });

    return PlainToInstanceList(
      Artist,
      recentArtists.map((i) => i.artist),
    );
  }

  // TODO
  // update(id: number, updateArtistDto: UpdateArtistDto) {
  //   return `This action updates a #${id} artist`;
  // }

  remove(id: number) {
    return `This action removes a #${id} artist`;
  }

  async external_getSimilarArtists(artistId: number) {
    const artist = await this.prisma.artist.findFirstOrThrow({
      where: { id: artistId },
    });

    const spotifyArtistId = artist.spotifyArtistId;

    const apiUrl =
      this.config.get('externalApi.recommendation.baseUrl') +
      'recommend-similar-artists';
    const recommendationResult = await axios
      .post<{
        result: string;
      }>(apiUrl, {
        artistId: spotifyArtistId,
      })
      .then((res) => res.data.result);

    if (!recommendationResult?.length) {
      throw new BadRequestException('No recommendation tracks found');
    }

    const similarSpotifyArtistIds = recommendationResult.split(',');

    const similarArtists = await this.prisma.artist.findMany({
      where: {
        spotifyArtistId: { in: similarSpotifyArtistIds },
      },
    });

    console.log(`Similar Artists for ${artist.name.toUpperCase()}:`);
    console.table(
      similarArtists.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    );

    return PlainToInstanceList(ArtistWithForeign, similarArtists);
  }

  async getMostPopularArtists(limit: number = 20) {
    const artists = await this.prisma.artist.findMany({
      orderBy: {
        temp_popularity: 'desc',
      },
      take: limit,
    });

    return PlainToInstanceList(Artist, artists);
  }
}
