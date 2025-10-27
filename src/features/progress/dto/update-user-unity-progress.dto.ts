import { PartialType } from '@nestjs/swagger';
import { CreateUserUnityProgressDto } from './create-user-unity-progress.dto';

export class UpdateUserUnityProgressDto extends PartialType(CreateUserUnityProgressDto) {}
