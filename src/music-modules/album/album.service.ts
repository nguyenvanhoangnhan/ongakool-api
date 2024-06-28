import { Injectable } from '@nestjs/common';
import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { Album, AlbumWithForeign } from './entities/album.entity';
import { SearchArtistNameQueryDto } from 'src/artist/dto/searchArtistName.dto';
// import { CreateAlbumDto } from './dto/create-album.dto';
// import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
  constructor(private prisma: PrismaService) {}
  // create(createAlbumDto: CreateAlbumDto) {
  //   return 'This action adds a new album';
  // }

  findAll() {
    return `This action returns all album`;
  }

  getById(id: number) {
    const album = this.prisma.album.findFirstOrThrow({
      where: { id },
      include: {
        artist: true,
        tracks: {
          include: {
            mainArtist: true,
            album: true,
            audio: true,
          },
        },
      },
    });

    return PlainToInstance(AlbumWithForeign, album);
  }

  findOneWithTrack(id: number) {
    const album = this.prisma.album.findFirstOrThrow({
      where: { id },
      include: { tracks: true },
    });

    return PlainToInstance(Album, album);
  }

  findOneWithForeign(id: number) {
    const album = this.prisma.album.findFirstOrThrow({
      where: { id },
      include: { artist: true, tracks: true },
    });

    return PlainToInstance(Album, album);
  }

  // update(id: number, updateAlbumDto: UpdateAlbumDto) {
  //   return `This action updates a #${id} album`;
  // }

  remove(id: number) {
    return `This action removes a #${id} album`;
  }

  async getMostPopularAlbums(limit: number = 20) {
    const albums = await this.prisma.album.findMany({
      orderBy: {
        temp_popularity: 'desc',
      },
      include: {
        artist: true,
      },
      take: limit,
    });

    return PlainToInstance(AlbumWithForeign, albums);
  }

  async searchAlbum(filter: SearchArtistNameQueryDto) {
    const artists = await this.prisma.album.findMany({
      where: {
        title: { contains: filter.searchText.trim() },
      },
      include: {
        tracks: true,
        artist: true,
      },
      orderBy: {
        temp_popularity: 'desc',
      },
      take: 20,
    });

    return PlainToInstanceList(AlbumWithForeign, artists);
  }
}
