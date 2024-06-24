import {
  ValidateApiPropRequiredString,
  ValidateApiPropOptionalNumber,
} from 'src/decorator/validate.decorators';

export class SearchTrackByLyricsQueryDto {
  @ValidateApiPropRequiredString()
  text: string;

  @ValidateApiPropOptionalNumber()
  limit: number = 20;
}
