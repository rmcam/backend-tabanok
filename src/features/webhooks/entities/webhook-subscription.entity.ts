import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { WebhookEventType } from '../interfaces/webhook.interface';
import { v4 as uuidv4 } from 'uuid';

@Entity('webhook_subscriptions')
export class WebhookSubscription {
    @PrimaryColumn('uuid', { default: uuidv4() })
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