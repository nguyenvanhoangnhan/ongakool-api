import { ValidateApiPropOptionalString } from 'src/decorator/validate.decorators';
export class UpdatePlaylistDto {
  @ValidateApiPropOptionalString() name?: string;
}
