import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida

export enum NotificationType {
    ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
    REWARD_EARNED = 'reward_earned',
    LEVEL_UP = 'level_up',
    STREAK_MILESTONE = 'streak_milestone',
    CULTURAL_CONTENT = 'cultural_content',
    SYSTEM = 'system'
}

export enum NotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export enum NotificationStatus {
    UNREAD = 'unread',
    READ = 'read',
    ARCHIVED = 'archived'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: NotificationType
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM
    })
    priority: NotificationPriority;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD
    })
    status: NotificationStatus;

    @Column({ default: false })
    isRead: boolean;

    @Column({ type: 'timestamp', nullable: true })
    readAt?: Date;

    @Column('json', { nullable: true })
    metadata?: {
        actionType?: string;
        actionUrl?: string;
        resourceId?: string;
        resourceType?: string;
        additionalInfo?: Record<string, any>;
    };

    @ManyToOne(() => User)
    user: User;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isPush: boolean;

    @Column({ default: false })
    isEmail: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
