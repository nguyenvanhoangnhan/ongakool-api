import { Transform } from 'class-transformer';
import {
  ApiPropNumber,
  ApiPropType,
  ApiPropString,
} from 'src/decorator/entity.decorator';
import { Track } from 'src/music-modules/track/entities/track.entity';

export class Audio {
  @ApiPropNumber()
  id: number;

  @ApiPropString()
  label: string;

  @ApiPropString()
  path: string;

  @ApiPropString()
  s3ObjectKey: string;

  @ApiPropNumber()
  size: number;

  @ApiPropNumber()
  length: number;

  @ApiPropString()
  fullUrl: string;

  @ApiPropNumber()
  createdAt: number;

  @ApiPropNumber()
  updatedAt: number;

  @ApiPropType(Track)
  @Transform(({ obj }) => obj?.track)
  track: Track[];
}
