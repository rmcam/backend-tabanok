import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseService } from './exercise.service';

@ApiTags('exercises')
@Controller('exercises')
export class ExerciseController {
    constructor(private readonly exerciseService: ExerciseService) { }

    @Post()
    create(@Body() createExerciseDto: CreateExerciseDto) {
        return this.exerciseService.create(createExerciseDto);
    }

    @Get()
    findAll() {
        return this.exerciseService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.exerciseService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
        return this.exerciseService.update(id, updateExerciseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.exerciseService.remove(id);
    }
} 