import { PartialType } from '@nestjs/swagger';
import { CreateUnityDto } from './create-unity.dto';

export class UpdateUnityDto extends PartialType(CreateUnityDto) {}
