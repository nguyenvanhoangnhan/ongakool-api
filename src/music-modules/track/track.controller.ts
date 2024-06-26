import { SearchTrack } from './dto/searchTrackByLyrics-query.dto';
import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  Param,
  Delete,
  Query,
  Post,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { TrackService } from './track.service';
// import { CreateTrackDto } from './dto/create-track.dto';
// import { UpdateTrackDto } from './dto/update-track.dto';
import { FindManyTrackQueryDto } from './dto/findManyTrack.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AuthData,
  GetAuthData,
} from 'src/auth/decorator/get-auth-data.decorator';
import { ToggleLikeTrackDto } from './dto/toggleLikeTrack.dto';
import { ApiBearerUserGuard } from 'src/decorator/auth.dectorator';

@Controller('track')
@ApiTags('TRACK')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  // @Post()
  // create(@Body() createTrackDto: CreateTrackDto) {
  //   return this.trackService.create(createTrackDto);
  // }

  @Get()
  async findAll() {
    throw new ForbiddenException('Forbidden');
    return await this.trackService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  async getById(@Param('id') id: string, @GetAuthData() authData: AuthData) {
    return await this.trackService.getById(+id, authData);
  }

  @Get('get-many-by-query')
  @ApiBearerAuth()
  async getMany(
    @Query() query: FindManyTrackQueryDto,
    @GetAuthData() authData: AuthData,
  ) {
    return await this.trackService.getMany(query, authData);
  }

  @Get('get-recent')
  @ApiBearerUserGuard()
  async GetRecentTracks(@GetAuthData() authData: AuthData) {
    console.log('authData', authData);
    return await this.trackService.getRecentListenTracks(authData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackService.remove(+id);
  }

  @Post(':id/listen')
  @ApiBearerUserGuard()
  async listenToTrack(
    @Param('id') id: string,
    @GetAuthData() authData: AuthData,
  ) {
    return await this.trackService.listenTrack(+id, authData);
  }

  @Post('toggle-like')
  @ApiBearerUserGuard()
  async toggleLikeTrack(
    @Body() body: ToggleLikeTrackDto,
    @GetAuthData() authData: AuthData,
  ) {
    return await this.trackService.toggleLikeTrack(body, authData);
  }

  @Get('search-by-lyrics')
  async searchTrackByLyrics(@Query() query: SearchTrack) {
    return await this.trackService.external_searchTrackByLyrics(query);
  }

  @Get('search-by-title')
  async searchTrackByTitle(@Query() query: SearchTrack) {
    return await this.trackService.searchTrackByTitle(query);
  }

  @Get('temp___count-least-popular-tracks')
  async countLeastPopularTracks(
    @Query('lessThanOrEqual') lessThanOrEqual: number,
  ) {
    // throw new ForbiddenException('Forbidden');
    return {
      result:
        await this.trackService.chore_countLeastPopularTracks(+lessThanOrEqual),
    };
  }

  @Get('popular')
  async getPopularTracks(@Query('limit') limit: number = 20) {
    return this.trackService.getMostPopularTracks(+limit);
  }

  @Get('recommendation/recently-listening-based')
  @ApiBearerUserGuard()
  async getRecentlyListeningBasedRecommendation(
    @GetAuthData() authData: AuthData,
  ) {
    return await this.trackService.external_getRecommendBasedOnRecentlyListening(
      authData.id,
    );
  }
}
