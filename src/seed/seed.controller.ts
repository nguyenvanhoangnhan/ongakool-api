import { Controller, ForbiddenException, Get, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('seed')
@ApiTags('Seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('artist')
  async seedArtist() {
    throw new ForbiddenException('Forbidden');
    await this.seedService.seedArtist();

    return {
      message: 'Seed artist success',
    };
  }

  @Post('album')
  async seedAlbum() {
    throw new ForbiddenException('Forbidden');

    await this.seedService.seedAlbum();
    return {
      message: 'Seed album success',
    };
  }

  @Post('track')
  async seedTrack() {
    throw new ForbiddenException('Forbidden');

    await this.seedService.seedTrack();

    return {
      message: 'Seed track success',
    };
  }

  @Get('chore')
  async seedChore() {
    throw new ForbiddenException('Forbidden');
    await this.seedService.chore();

    return {
      message: 'success',
    };
  }

  @Get('seed-track-popularity')
  async seedTrackPopularity() {
    // throw new ForbiddenException('Forbidden');
    await this.seedService.seedTrackPopularity();

    return {
      message: 'success',
    };
  }
}
