import { AlbumGroup, AlbumType } from '@prisma/client';
import { Image } from 'src/accessory-modules/image/entities/image.entity';
import { Artist } from 'src/artist/entities/artist.entity';
import {
  ApiPropEnumOptional,
  ApiPropNumber,
  ApiPropTypeOptional,
} from 'src/decorator/entity.decorator';
import { Track } from 'src/music-modules/track/entities/track.entity';
import { Pivot_UserListenAlbum } from 'src/pivot/pivots.entity';

export class Album {
  @ApiPropNumber() id: number;
  @ApiPropNumber() spotifyAlbumId: number;

  @ApiPropNumber() artistId: number;
  @ApiPropNumber() coverImageId: number;

  @ApiPropEnumOptional(AlbumGroup) albumGroup?: AlbumGroup;
  @ApiPropEnumOptional(AlbumGroup) albumType?: AlbumType;

  @ApiPropNumber() releasedAt: number;
  @ApiPropNumber() createdAt: number;
  @ApiPropNumber() updatedAt: number;
}

export class AlbumWithForeign {
  @ApiPropTypeOptional(Image) coverImage?: Image;
  @ApiPropTypeOptional(Track) tracks?: Track[];
  @ApiPropTypeOptional(Artist) artist?: Artist;

  @ApiPropTypeOptional(Pivot_UserListenAlbum)
  user_listen_albums?: Pivot_UserListenAlbum[];
}
