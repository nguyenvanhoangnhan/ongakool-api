import { Album } from 'src/music-modules/album/entities/album.entity';
import { Audio } from 'src/music-modules/audio/entities/audio.entity';
import {
  ApiProp01Optional,
  ApiPropNumber,
  ApiPropString,
  ApiPropTypeOptional,
} from 'src/decorator/entity.decorator';
import {
  Pivot_PlaylistTrackLink,
  Pivot_SecondaryArtistTrackLink,
  Pivot_UserFavouriteTrack,
  Pivot_UserListenTrack,
} from 'src/pivot/pivots.entity';
import { Artist } from 'src/artist/entities/artist.entity';
import { Transform } from 'class-transformer';
import { PlainToInstance } from 'src/helpers';
import { ValidateApiPropOptionalString } from 'src/decorator/validate.decorators';
import { Lyrics } from './lyrics.entity';

export class Track {
  @ApiPropString() id: number;
  @ApiPropString() title: string;
  @ApiPropString() artistNames: string;
  @ApiPropString() spotifyTrackId: string;
  @ApiPropNumber() mainArtistId: number;
  @ApiPropNumber() listenCount: number;
  @ApiPropNumber() albumId: number;
  @ApiPropNumber() audioId: number;
  @ValidateApiPropOptionalString() previewAudioUrl?: string;

  @ApiProp01Optional() isFavourite?: 0 | 1;
}

export class TrackWithForeign extends Track {
  @ApiPropTypeOptional(Artist)
  @Transform(({ obj }) => PlainToInstance(Artist, obj?.mainArtist))
  mainArtist?: Artist;

  @ApiPropTypeOptional(Album)
  @Transform(({ obj }) => PlainToInstance(Album, obj?.album))
  album?: Album;

  @ApiPropTypeOptional(Audio)
  @Transform(({ obj }) => PlainToInstance(Audio, obj?.audio))
  audio?: Audio;

  @ApiPropTypeOptional(Lyrics)
  @Transform(({ obj }) => PlainToInstance(Lyrics, obj?.lyrics))
  lyrics?: Lyrics;

  @ApiPropTypeOptional([Pivot_UserListenTrack])
  @Transform(({ obj }) =>
    PlainToInstance(Pivot_UserListenTrack, obj?.user_listen_tracks),
  )
  user_listen_tracks?: Pivot_UserListenTrack[];

  @ApiPropTypeOptional([Pivot_UserFavouriteTrack])
  @Transform(({ obj }) =>
    PlainToInstance(Pivot_UserFavouriteTrack, obj?.user_favourite_tracks),
  )
  user_favourite_tracks?: Pivot_UserFavouriteTrack[];

  @ApiPropTypeOptional([Pivot_PlaylistTrackLink])
  @Transform(({ obj }) =>
    PlainToInstance(Pivot_PlaylistTrackLink, obj?.playlist_track_links),
  )
  playlist_track_links?: Pivot_PlaylistTrackLink[];

  @ApiPropTypeOptional([Pivot_SecondaryArtistTrackLink])
  @Transform(({ obj }) =>
    PlainToInstance(
      Pivot_SecondaryArtistTrackLink,
      obj?.secondary_artist_track_links,
    ),
  )
  secondary_artist_track_links: Pivot_SecondaryArtistTrackLink[];
}
