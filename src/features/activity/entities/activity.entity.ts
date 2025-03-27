import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';
import { ActivityContent } from '../interfaces/activity-content.interface';

export enum ActivityType {
  VOCABULARY_QUIZ = 'vocabulary_quiz',
  MEMORY_GAME = 'memory_game',
  WORD_MATCHING = 'word_matching',
  PRONUNCIATION_PRACTICE = 'pronunciation_practice',
  CULTURAL_STORY = 'cultural_story',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity()
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Aprende los saludos básicos' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Practica los saludos más comunes en Kamëntsá' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: ActivityType })
  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.VOCABULARY_QUIZ,
  })
  type: ActivityType;

  @ApiProperty({ enum: DifficultyLevel })
  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.BEGINNER,
  })
  difficultyLevel: DifficultyLevel;

  @ApiProperty({
    example: {
      questions: [
        {
          question: '¿Cómo se dice "hola" en Kamëntsá?',
          options: ['Bëngbe', 'Tsëntsë', 'Bëngbe tsëntsë'],
          correctAnswer: 'Bëngbe',
          points: 10,
        },
      ],
      timeLimit: 300,
      minScore: 70,
      maxAttempts: 3,
    },
  })
  @Column('jsonb')
  content: ActivityContent;

  @ApiProperty({ example: 100 })
  @Column('int', { default: 0 })
  totalPoints: number;

  @ApiProperty({ example: 300 })
  @Column('int', { default: 300 })
  timeLimit: number;

  @ApiProperty({ example: true })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ example: 3 })
  @Column('int', { default: 3 })
  maxAttempts: number;

  @ApiProperty({ example: 70 })
  @Column('int', { default: 70 })
  minScoreToPass: number;

  @ManyToOne(() => Topic, (topic) => topic.activities)
  topic: Topic;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}