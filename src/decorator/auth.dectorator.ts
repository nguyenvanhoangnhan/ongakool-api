import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserGuard } from 'src/auth/guard/auth.guard';

export function GuardUser() {
  return applyDecorators(UseGuards(UserGuard), ApiBearerAuth());
}
