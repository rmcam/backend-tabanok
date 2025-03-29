import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../../features/account/entities/account.entity';
import { CulturalAchievement } from '../../features/gamification/entities/cultural-achievement.entity';
import { UserAchievement } from '../../features/gamification/entities/user-achievement.entity';
import { UserLevel } from '../../features/gamification/entities/user-level.entity';
import { UserReward } from '../../features/gamification/entities/user-reward.entity';
import { Notification } from '../../features/notifications/entities/notification.entity';

export enum UserRole {
    USER = 'user',
    MODERATOR = 'moderator',
    ADMIN = 'admin',
    ELDER = 'elder',      // Sabedor tradicional
    TEACHER = 'teacher'   // Profesor
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned',
    PENDING = 'pending'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    status: UserStatus;

    @Column({ nullable: true })
    avatarUrl?: string;

    @Column('simple-array')
    languages: string[];

    @Column('json', { nullable: true })
    preferences?: {
        notifications: boolean;
        language: string;
        theme: string;
    };

    @Column('json', { nullable: true })
    profile?: {
        bio: string;
        location: string;
        interests: string[];
        community?: string;
    };

    @Column('json', {
        default: {
            totalPoints: 0,
            level: 1,
            streak: 0,
            lastActivity: new Date()
        }
    })
    gameStats: {
        totalPoints: number;
        level: number;
        streak: number;
        lastActivity: Date;
    };

    @Column({ default: 0 })
    points: number;

    @Column({ default: 1 })
    currentLevel: number;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpires: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

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

    @OneToMany(() => UserAchievement, userAchievement => userAchievement.user)
    userAchievements: UserAchievement[];

    @OneToMany(() => UserReward, userReward => userReward.user)
    userRewards: UserReward[];

    @OneToOne(() => UserLevel)
    @JoinColumn()
    userLevel: UserLevel;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ default: 0 })
    culturalPoints: number;

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[];

    @OneToMany(() => Account, account => account.user)
    accounts: Account[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 