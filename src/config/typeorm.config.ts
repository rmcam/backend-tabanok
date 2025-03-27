import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Account } from '../features/account/entities/account.entity';
import { Content } from '../features/content/entities/content.entity';
import { CulturalContent } from '../features/cultural-content/cultural-content.entity';
import { Evaluation } from '../features/evaluation/evaluation.entity';
import { Exercise } from '../features/exercise/entities/exercise.entity';
import { Lesson } from '../features/lesson/entities/lesson.entity';
import { Progress } from '../features/progress/entities/progress.entity';
import { Reward } from '../features/reward/entities/reward.entity';
import { Topic } from '../features/topic/entities/topic.entity';
import { Unity } from '../features/unity/entities/unity.entity';
import { User } from '../features/user/entities/user.entity';
import { Vocabulary } from '../features/vocabulary/entities/vocabulary.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) { }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.configService.get<string>('DB_HOST'),
            port: this.configService.get<number>('DB_PORT'),
            username: this.configService.get<string>('DB_USER'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.get<string>('DB_NAME'),
            entities: [
                Account,
                Content,
                CulturalContent,
                Exercise,
                Evaluation,
                Lesson,
                Progress,
                Reward,
                Topic,
                Unity,
                User,
                Vocabulary,
            ],
            synchronize: false,
            logging: true,
            migrations: ['dist/migrations/*.js'],
            migrationsRun: false,
            ssl: this.configService.get<string>('DB_SSL') === 'true',
        };
    }
}
