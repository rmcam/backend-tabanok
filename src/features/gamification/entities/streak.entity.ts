import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('streaks')
export class Streak {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ default: 0 })
    currentStreak: number;

    @Column({ default: 0 })
    longestStreak: number;

    @Column({ type: 'timestamp', nullable: true })
    lastActivityDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    graceDate: Date;

    @Column({ default: false })
    usedGracePeriod: boolean;

    @Column('jsonb', { default: [] })
    streakHistory: {
        date: Date;
        pointsEarned: number;
        bonusMultiplier: number;
    }[];

    @Column({ default: 1 })
    currentMultiplier: number;
} 