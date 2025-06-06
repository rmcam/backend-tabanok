import { SetMetadata } from '@nestjs/common';
import { AppPermission } from '../enums/permission.enum'; // Import AppPermission

export const ROLES_KEY = 'roles'; // Consider renaming this key later
export const Roles = (...permissions: AppPermission[]) => SetMetadata(ROLES_KEY, permissions); // Accept AppPermission[]
