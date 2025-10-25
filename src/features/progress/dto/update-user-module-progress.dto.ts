import { PartialType } from '@nestjs/swagger';
import { CreateUserModuleProgressDto } from './create-user-module-progress.dto';

export class UpdateUserModuleProgressDto extends PartialType(CreateUserModuleProgressDto) {}
