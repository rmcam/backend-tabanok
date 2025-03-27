import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { WebhookEventType } from '../interfaces/webhook.interface';

@Entity('webhook_subscriptions')
export class WebhookSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    url: string;

    @Column('simple-array')
    events: WebhookEventType[];

    @Column('text')
    secret: string;

    @Column('boolean', { default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('timestamp', { nullable: true })
    lastTriggeredAt: Date;

    @Column('int', { default: 0 })
    failureCount: number;

    @Column('jsonb', { nullable: true })
    metadata: {
        description?: string;
        tags?: string[];
        [key: string]: any;
    };
} 