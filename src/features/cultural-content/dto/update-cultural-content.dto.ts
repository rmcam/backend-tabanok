import { PartialType } from '@nestjs/swagger';
import { CreateCulturalContentDto } from './create-cultural-content.dto';

export class UpdateCulturalContentDto extends PartialType(CreateCulturalContentDto) { } 