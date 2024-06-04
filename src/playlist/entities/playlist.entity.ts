import { Image } from 'src/accessory-modules/image/entities/image.entity';
import {
  ApiPropNumber,
  ApiPropStringOptional,
  ApiPropTypeOptional,
  ApiPropUnixOptional,
} from 'src/decorator/entity.decorator';
import { Pivot_PlaylistTrackLink } from 'src/pivot/pivots.entity';
import { User } from 'src/user/entities/user.entity';

export class Playlist {
  @ApiPropNumber() id: number;

  @ApiPropStringOptional() name?: string;
  @ApiPropStringOptional() description?: string;

  @ApiPropNumber() ownerUserId: number;
  @ApiPropNumber() coverImageId: number;

  @ApiPropUnixOptional() createdAt?: number;
  @ApiPropUnixOptional() updatedAt?: number;
}

export class PlaylistWithForeign extends Playlist {
  @ApiPropTypeOptional(User) ownerUser?: User;
  @ApiPropTypeOptional(Image) coverImage?: Image;

  @ApiPropTypeOptional([Pivot_PlaylistTrackLink])
  playlist_track_links?: Pivot_PlaylistTrackLink[];
}
