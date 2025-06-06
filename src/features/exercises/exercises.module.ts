import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { AuthModule } from '../../auth/auth.module'; // Import AuthModule

@Module({
    imports: [
        TypeOrmModule.forFeature([Exercise]),
        AuthModule, // Import AuthModule
    ],
    controllers: [ExercisesController],
    providers: [ExercisesService],
    exports: [ExercisesService]
})
export class ExercisesModule { }
