import { Column, Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('streaks')
export class Streak {
    @PrimaryColumn('uuid', { default: uuidv4() })
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

    @Column({ type: 'numeric', default: 1 })
    currentMultiplier: number;
}
