import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator'; // Consider renaming this key later
import { AppPermission } from '../enums/permission.enum'; // Import AppPermission
import { AuthorizationService } from '../services/authorization.service'; // Import AuthorizationService
import { User } from '../entities/user.entity'; // Import User entity

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService, // Inject AuthorizationService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<AppPermission[]>( // Change type to AppPermission[]
      ROLES_KEY, // Still using ROLES_KEY for now, will refactor later
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No specific permissions required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
        return false; // No user authenticated
    }

    // Use the AuthorizationService to check if the user has any of the required permissions
    return this.authorizationService.hasAnyPermission(user as User, requiredPermissions);
  }
}
