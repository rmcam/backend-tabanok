import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CulturalAchievement } from '../../features/gamification/entities/cultural-achievement.entity';

export enum UserRole {
    USER = 'user',
    MODERATOR = 'moderator',
    ADMIN = 'admin',
    MENTOR = 'mentor',
    CULTURAL_LEADER = 'cultural_leader'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    profilePicture?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @Column('int', { default: 0 })
    culturalPoints: number;

    @Column('int', { default: 1 })
    level: number;

    @Column('json', { nullable: true })
    preferences?: {
        language: string;
        notifications: boolean;
        culturalInterests: string[];
    };

    @Column('json', { nullable: true })
    stats?: {
        eventsParticipated: number;
        achievementsCompleted: number;
        mentorshipHours: number;
        contributionsCount: number;
    };

    @ManyToMany(() => CulturalAchievement, achievement => achievement.users)
    @JoinTable({
        name: 'user_achievements',
        joinColumn: {
            name: 'userId',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'achievementId',
            referencedColumnName: 'id'
        }
    })
    achievements: CulturalAchievement[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt?: Date;
} 