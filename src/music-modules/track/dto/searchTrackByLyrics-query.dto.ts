import {
  ValidateApiPropRequiredString,
  ValidateApiPropOptionalNumber,
} from 'src/decorator/validate.decorators';

export class SearchTrack {
  @ValidateApiPropRequiredString()
  text: string;

  @ValidateApiPropOptionalNumber()
  limit: number = 20;
}
