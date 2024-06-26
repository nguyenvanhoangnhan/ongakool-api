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
    throw new ForbiddenException('Forbidden');
    await this.seedService.seedTrackPopularity();

    return {
      message: 'success',
    };
  }

  @Get('seed-artist-popularity')
  async seedArtistPopularity() {
    // throw new ForbiddenException('Forbidden');
    await this.seedService.seedArtistPopularity();

    return {
      message: 'success',
    };
  }

  @Get('seed-album-popularity')
  async seedAlbumPopularity() {
    // throw new ForbiddenException('Forbidden');
    await this.seedService.seedAlbumPopularity();

    return {
      message: 'success',
    };
  }

  @Post('seed-audio')
  async seedAudio() {
    // throw new ForbiddenException('Forbidden');

    await this.seedService.seedAudio();

    return {
      message: 'success',
    };
  }

  @Post('getSomeTracksThatNotHaveAudio')
  async getSomeTracksThatNotHaveAudio() {
    throw new ForbiddenException('Forbidden');

    await this.seedService.getSomeTracksThatNotHaveAudio();

    return {
      message: 'success',
    };
  }

  @Post('seed-track-lyrics')
  async seedTrackLyrics() {
    throw new ForbiddenException('Forbidden');

    await this.seedService.seedLyrics();

    return {
      message: 'success',
    };
  }

  @Post('update-empty-title')
  async updateEmptyTitle() {
    throw new ForbiddenException('Forbidden');

    await this.seedService.updateEmptyTitle();

    return {
      message: 'success',
    };
  }

  @Post('update-empty-preview-url')
  async updateEmptyPreviewUrl() {
    // throw new ForbiddenException('Forbidden');

    await this.seedService.updateEmptyPreviewUrl();

    return {
      message: 'success',
    };
  }
}
