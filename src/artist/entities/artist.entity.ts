import { Transform } from 'class-transformer';
import {
  ApiPropNumber,
  ApiPropString,
  ApiPropStringOptional,
  ApiPropTypeOptional,
} from 'src/decorator/entity.decorator';
import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { Album } from 'src/music-modules/album/entities/album.entity';
import { Track } from 'src/music-modules/track/entities/track.entity';
import { User } from 'src/user/entities/user.entity';

export class Artist {
  @ApiPropNumber() id: number;
  @ApiPropString() spotifyArtistId: string;
  @ApiPropString() name: string;
  @ApiPropString() introduction: string;
  @ApiPropNumber() userId: number;

  @ApiPropNumber() temp_popularity: number;

  @ApiPropStringOptional() avatarImageUrl: string;
  @ApiPropStringOptional() coverImageUrl: string;
  @ApiPropNumber() createdAt: number;
  @ApiPropNumber() updatedAt: number;
}

export class ArtistWithForeign extends Artist {
  @Transform(({ obj }) => PlainToInstanceList(User, obj.User))
  @ApiPropTypeOptional([Album])
  albums?: Album[];

  @Transform(({ obj }) => PlainToInstanceList(Track, obj.tracks))
  @ApiPropTypeOptional([Track])
  tracks?: Track[];

  @Transform(({ obj }) => PlainToInstance(User, obj.User))
  @ApiPropTypeOptional(User)
  User?: User;
}
