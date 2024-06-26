import { Artist } from 'src/artist/entities/artist.entity';
import {
  ApiPropNumber,
  ApiPropString,
  ApiPropTypeOptional,
} from 'src/decorator/entity.decorator';
import {
  Pivot_UserFavouriteTrack,
  Pivot_UserListenAlbum,
  Pivot_UserListenTrack,
} from 'src/pivot/pivots.entity';
import { Playlist } from 'src/music-modules/playlist/entities/playlist.entity';
import { Profile } from './profile.entity';
import { Transform } from 'class-transformer';

export class User {
  @ApiPropNumber() id: number;

  @ApiPropString() email: string;
  // @ApiPropString() pwdHash: string;
  // @ApiPropString() pwdSalt: string;
  @ApiPropString() fullname: string;
  @ApiPropString() avatarImageUrl: string;
  @ApiPropNumber() createdAt: number;
  @ApiPropNumber() updatedAt: number;
}

export class UserWithForeign extends User {
  @ApiPropTypeOptional(Profile)
  @Transform(({ obj }) => obj?.profile)
  profile?: Profile;

  @ApiPropTypeOptional(Artist)
  @Transform(({ obj }) => obj?.artist)
  artist?: Artist;

  @ApiPropTypeOptional([Pivot_UserListenTrack])
  @Transform(({ obj }) => obj?.user_listen_track)
  user_listen_track?: Pivot_UserListenTrack[];

  @ApiPropTypeOptional([Pivot_UserListenAlbum])
  @Transform(({ obj }) => obj?.user_listen_album)
  user_listen_album?: Pivot_UserListenAlbum[];

  @ApiPropTypeOptional([Playlist])
  @Transform(({ obj }) => obj?.playlist)
  playlist?: Playlist[];

  @ApiPropTypeOptional([Pivot_UserFavouriteTrack])
  @Transform(({ obj }) => obj?.user_favourite_tracks)
  user_favourite_tracks?: Pivot_UserFavouriteTrack[];
}
