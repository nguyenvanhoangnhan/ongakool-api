import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import {
  AuthData,
  GetAuthData,
} from 'src/auth/decorator/get-auth-data.decorator';
import { AddTrackToPlaylistDto } from './dto/addTrackToPlaylist.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiBearerUserGuard } from 'src/decorator/auth.dectorator';
import { SuccessMessageResp } from 'src/util/common.util';
import { UpdatePlaylistDto } from './dto/updatePlaylist.dto';
import { UserGuard } from 'src/auth/guard/auth.guard';
import { APISummaries } from 'src/helpers';
import { UploadFileDto } from 'src/util/common.dto';
import { FastifyFileInterceptor } from 'src/util/file.util';
// import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlist')
@ApiTags('Playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @ApiBearerUserGuard()
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
  @ApiBearerUserGuard()
  getMyPlaylists(@GetAuthData() authData: AuthData) {
    return this.playlistService.getMyPlaylists(authData);
  }

  @Post('/add-track')
  @ApiBearerUserGuard()
  async addTrackToPlaylist(
    @Body() body: AddTrackToPlaylistDto,
    @GetAuthData() authData: AuthData,
  ) {
    await this.playlistService.addTrackToPlaylist(body, authData);

    return SuccessMessageResp();
  }

  @ApiOperation({ summary: APISummaries.USER })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post(':id/set-cover')
  @UseInterceptors(FastifyFileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async setPlaylistCover(
    @Param('id') id: string,
    @GetAuthData() authData: AuthData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() dto: UploadFileDto, // For Swagger
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.playlistService.setCover(+id, file, authData);
    return SuccessMessageResp();
  }

  @ApiBearerUserGuard()
  @Put(':id')
  async updatePlaylistCover(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @GetAuthData() authData: AuthData,
  ) {
    await this.playlistService.update(+id, updatePlaylistDto, authData);

    return SuccessMessageResp();
  }

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
