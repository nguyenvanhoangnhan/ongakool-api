import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import {
  AuthData,
  GetAuthData,
} from 'src/auth/decorator/get-auth-data.decorator';
import { AddTrackToPlaylistDto } from './dto/addTrackToPlaylist.dto';
import { ApiTags } from '@nestjs/swagger';
import { GuardUser } from 'src/decorator/auth.dectorator';
import { SuccessMessageResp } from 'src/util/common.util';
// import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlist')
@ApiTags('Playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @GuardUser()
  create(
    @GetAuthData()
    authData: AuthData,
  ) {
    return this.playlistService.create(authData);
  }

  @Get()
  findAll() {
    return this.playlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistService.findOneWithForeign(+id);
  }

  @Get('mine')
  @GuardUser()
  getMyPlaylists(@GetAuthData() authData: AuthData) {
    return this.playlistService.getMyPlaylists(authData);
  }

  @Post('/add-track')
  @GuardUser()
  async addTrackToPlaylist(
    @Body() body: AddTrackToPlaylistDto,
    @GetAuthData() authData: AuthData,
  ) {
    await this.playlistService.addTrackToPlaylist(body, authData);

    return SuccessMessageResp();
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePlaylistDto: UpdatePlaylistDto,
  // ) {
  //   return this.playlistService.update(+id, updatePlaylistDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.playlistService.remove(+id);

    return SuccessMessageResp();
  }

  @Get(':id/recommend-tracks')
  async getRecommendationTracksForPlaylist(@Param('id') id: string) {
    return this.playlistService.external_getRecommendationTracksForPlaylist(
      +id,
    );
  }
}
