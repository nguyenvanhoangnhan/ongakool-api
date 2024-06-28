import { PlainToInstance } from 'src/helpers';
import { Artist } from 'src/artist/entities/artist.entity';
import {
  ApiPropNumber,
  ApiPropTypeOptional,
} from 'src/decorator/entity.decorator';
import {
  Track,
  TrackWithForeign,
} from 'src/music-modules/track/entities/track.entity';
import { Playlist } from 'src/music-modules/playlist/entities/playlist.entity';
import { Transform } from 'class-transformer';
import { Album } from 'src/music-modules/album/entities/album.entity';

export class Pivot_UserListenTrack {
  @ApiPropNumber() id: number;
  @ApiPropNumber() userId: number;
  @ApiPropNumber() trackId: number;

  @ApiPropTypeOptional(Track)
  @Transform(({ obj }) => PlainToInstance(Track, obj?.track))
  track?: Track;
}

export class Pivot_UserFavouriteTrack {
  @ApiPropNumber() id: number;
  @ApiPropNumber() userId: number;
  @ApiPropNumber() trackId: number;

  @ApiPropTypeOptional(Track)
  @Transform(({ obj }) => PlainToInstance(Track, obj?.track))
  track?: Track;
}

export class Pivot_PlaylistTrackLink {
  @ApiPropNumber() id: number;
  @ApiPropNumber() playlistId: number;
  @ApiPropNumber() trackId: number;

  @ApiPropTypeOptional(Track)
  @Transform(({ obj }) => PlainToInstance(TrackWithForeign, obj?.track))
  track?: Track;

  @ApiPropTypeOptional(Playlist)
  @Transform(({ obj }) => PlainToInstance(Playlist, obj?.playlist))
  playlist?: Playlist;
}

export class Pivot_UserListenAlbum {
  @ApiPropNumber() id: number;
  @ApiPropNumber() userId: number;
  @ApiPropNumber() albumId: number;

  @ApiPropTypeOptional(Album)
  @Transform(({ obj }) => PlainToInstance(Album, obj?.album))
  album?: Album;
}

// secondary_artist_track_links
export class Pivot_SecondaryArtistTrackLink {
  @ApiPropNumber() id: number;
  @ApiPropNumber() artistId: number;
  @ApiPropNumber() trackId: number;

  @ApiPropTypeOptional(Track)
  @Transform(({ obj }) => PlainToInstance(Track, obj?.track))
  track?: Track;

  @ApiPropTypeOptional(Artist)
  @Transform(({ obj }) => PlainToInstance(Artist, obj?.artist))
  artist?: Artist;
}
