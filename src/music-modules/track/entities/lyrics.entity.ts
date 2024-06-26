import { ApiPropNumber, ApiPropString } from 'src/decorator/entity.decorator';

export class Lyrics {
  @ApiPropNumber() id: number;
  @ApiPropNumber() trackId: number;
  @ApiPropString() content: string;
  @ApiPropNumber() createdAt: number;
  @ApiPropNumber() updatedAt: number;
}
