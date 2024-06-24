import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TrackModule } from './music-modules/track/track.module';
import { AlbumModule } from './music-modules/album/album.module';
import { AudioModule } from './music-modules/audio/audio.module';
import { ArtistModule } from './artist/artist.module';
import { PlaylistModule } from './music-modules/playlist/playlist.module';
import { UserModule } from './user/user.module';
import AppConfig from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    PrismaModule,
    S3Module,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [AppConfig],
    }),
    AuthModule,
    TrackModule,
    AlbumModule,
    AudioModule,
    ArtistModule,
    PlaylistModule,
    UserModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
