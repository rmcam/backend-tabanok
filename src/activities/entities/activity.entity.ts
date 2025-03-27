import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topic } from '../../features/topic/entities/topic.entity';

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

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    nullable: true,
    default: DifficultyLevel.BEGINNER
  })
  difficulty: DifficultyLevel;

  @Column('jsonb')
  content: {
    questions?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
    pairs?: Array<{
      kamentsa: string;
      spanish: string;
    }>;
    audioUrl?: string;
    imageUrl?: string;
  };

  @Column('int', { default: 0 })
  points: number;

  @Column('int', { default: 300 })
  timeLimit: number;

  @ManyToOne(() => Topic, topic => topic.activities)
  topic: Topic;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
} 