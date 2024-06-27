import {
  ValidateApiPropOptionalListOfNumber,
  ValidateApiPropOptionalListOfString,
  ValidateApiPropOptionalNumber,
  ValidateApiPropOptionalString,
} from 'src/decorator/validate.decorators';
import { PaginationQueryDto } from 'src/util/common.dto';

export class FindManyTrackQueryDto extends PaginationQueryDto {
  @ValidateApiPropOptionalListOfNumber() ids: number[];
  @ValidateApiPropOptionalListOfString() spotifyIds: string[];
  @ValidateApiPropOptionalNumber() artistId: number;
  @ValidateApiPropOptionalNumber() albumId: number;
  @ValidateApiPropOptionalString() spotifyAlbumId: string;
  @ValidateApiPropOptionalString() spotifyArtistId: string;
  @ValidateApiPropOptionalNumber() playlistId: number;
}
