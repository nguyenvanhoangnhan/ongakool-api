import { AlbumGroup, AlbumType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ArtistWithForeign } from 'src/artist/entities/artist.entity';
import {
  ApiPropEnumOptional,
  ApiPropNumber,
  ApiPropStringOptional,
  ApiPropTypeOptional,
} from 'src/decorator/entity.decorator';
import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { TrackWithForeign } from 'src/music-modules/track/entities/track.entity';
import { Pivot_UserListenAlbum } from 'src/pivot/pivots.entity';

export class Album {
  @ApiPropNumber() id: number;
  @ApiPropNumber() spotifyAlbumId: string;
  @ApiPropStringOptional() title: string;

  @ApiPropNumber() artistId: number;
  @ApiPropStringOptional() coverImageUrl: string;

  @ApiPropNumber() temp_popularity: number;

  @ApiPropEnumOptional(AlbumGroup) albumGroup?: AlbumGroup;
  @ApiPropEnumOptional(AlbumGroup) albumType?: AlbumType;

  @ApiPropNumber() releasedAt: number;
  @ApiPropNumber() createdAt: number;
  @ApiPropNumber() updatedAt: number;
}

export class AlbumWithForeign extends Album {
  @Transform(({ obj }) => PlainToInstance(TrackWithForeign, obj?.tracks))
  @ApiPropTypeOptional(TrackWithForeign)
  tracks?: TrackWithForeign[];

  @Transform(({ obj }) => PlainToInstance(ArtistWithForeign, obj.artist))
  @ApiPropTypeOptional(ArtistWithForeign)
  artist?: ArtistWithForeign;

  @Transform(({ obj }) =>
    PlainToInstanceList(Pivot_UserListenAlbum, obj.user_listen_albums),
  )
  @ApiPropTypeOptional(Pivot_UserListenAlbum)
  user_listen_albums?: Pivot_UserListenAlbum[];
}
