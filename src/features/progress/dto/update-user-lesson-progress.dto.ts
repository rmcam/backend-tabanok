import { PartialType } from '@nestjs/swagger';
import { CreateUserLessonProgressDto } from './create-user-lesson-progress.dto';

export class UpdateUserLessonProgressDto extends PartialType(CreateUserLessonProgressDto) {}
