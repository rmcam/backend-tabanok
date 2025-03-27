import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../guard/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from './roles.decorator';

export function Auth(role: Role) {
  return applyDecorators(
    Roles(role),
    UseGuards(JwtAuthGuard, RolesGuard)
  );
}
