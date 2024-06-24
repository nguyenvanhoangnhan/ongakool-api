import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidateApiPropOptionalString } from 'src/decorator/validate.decorators';

export class UpdateProfileDto {
  @ValidateApiPropOptionalString() fullname?: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, nullable: true })
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password?: string;
}
