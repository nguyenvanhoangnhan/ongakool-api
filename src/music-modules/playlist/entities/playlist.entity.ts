import { PlainToInstance } from 'src/helpers';
import { Transform } from 'class-transformer';
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
  @ApiPropStringOptional() coverImageUrl: string;

  @ApiPropUnixOptional() createdAt?: number;
  @ApiPropUnixOptional() updatedAt?: number;
}

export class PlaylistWithForeign extends Playlist {
  @ApiPropTypeOptional(User)
  @Transform(({ obj }) => PlainToInstance(User, obj?.ownerUser))
  ownerUser?: User;

  @ApiPropTypeOptional([Pivot_PlaylistTrackLink])
  @Transform(({ obj }) => obj?.playlist_track_links)
  playlist_track_links?: Pivot_PlaylistTrackLink[];
}
