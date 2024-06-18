import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrackService } from './track.service';
// import { CreateTrackDto } from './dto/create-track.dto';
// import { UpdateTrackDto } from './dto/update-track.dto';
import { FindManyTrackQueryDto } from './dto/findManyTrack.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthData,
  GetAuthData,
} from 'src/auth/decorator/get-auth-data.decorator';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  // @Post()
  // create(@Body() createTrackDto: CreateTrackDto) {
  //   return this.trackService.create(createTrackDto);
  // }

  @Get()
  async findAll() {
    return await this.trackService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.trackService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto) {
  //   return this.trackService.update(+id, updateTrackDto);
  // }

  @Get('get-many-by-query')
  async findMany(@Query() query: FindManyTrackQueryDto) {
    return await this.trackService.findMany(query);
  }

  @Get('get-recent')
  @ApiBearerAuth()
  @UseGuards(UseGuards)
  async GetRecentTracks(@GetAuthData() authData: AuthData) {
    return await this.trackService.getRecentListenTracks(authData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackService.remove(+id);
  }
}
