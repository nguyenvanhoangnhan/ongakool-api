import {
  ValidateApiPropRequired01,
  ValidateApiPropRequiredNumber,
} from 'src/decorator/validate.decorators';
export class ToggleLikeTrackDto {
  @ValidateApiPropRequiredNumber()
  trackId: number;
  @ValidateApiPropRequired01()
  toggleOn: 1 | 0;
}
