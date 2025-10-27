import { PartialType } from '@nestjs/swagger';
import { CreateProgressDto } from './create-progress.dto';

export class UpdateOverallProgressDto extends PartialType(CreateProgressDto) { }
