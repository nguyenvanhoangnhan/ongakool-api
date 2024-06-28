import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { AlbumService } from './album.service';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  // @Post()
  // create(@Body() createAlbumDto: CreateAlbumDto) {
  //   return this.albumService.create(createAlbumDto);
  // }

  @Get()
  findAll() {
    return this.albumService.findAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.albumService.getById(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
  //   return this.albumService.update(+id, updateAlbumDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.albumService.remove(+id);
  }

  @Get('popular')
  async getPopularAlbums(@Query('limit') limit: number = 20) {
    return this.albumService.getMostPopularAlbums(+limit);
  }

  @Get('search/:searchText')
  searchArtistName(@Param('searchText') searchText: string) {
    return this.albumService.searchAlbum({ searchText });
  }
}
