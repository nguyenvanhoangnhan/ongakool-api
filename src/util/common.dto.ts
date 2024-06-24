import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ValidateApiPropOptionalNumber } from 'src/decorator/validate.decorators';

export class PaginationQueryDto {
  @ValidateApiPropOptionalNumber({ default: 1 }) page? = 1;
  @ValidateApiPropOptionalNumber({ default: 20 })
  pageSize? = 2;
}

export class UploadFileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, format: 'binary' })
  file: string;
}
