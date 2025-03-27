import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhookEventType, WebhookPayload } from './interfaces/webhook.interface';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 5000; // 5 segundos

    constructor(
        @InjectRepository(WebhookSubscription)
        private webhookRepository: Repository<WebhookSubscription>
    ) { }

    async createSubscription(
        url: string,
        events: WebhookEventType[],
        metadata?: any
    ): Promise<WebhookSubscription> {
        const secret = this.generateSecret();

        const subscription = this.webhookRepository.create({
            url,
            events,
            secret,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            failureCount: 0,
            metadata
        });

        return this.webhookRepository.save(subscription);
    }

    private generateSecret(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    async triggerEvent(eventType: WebhookEventType, data: any): Promise<void> {
        const subscriptions = await this.webhookRepository.find({
            where: {
                isActive: true,
                events: eventType
            }
        });

        const payload: WebhookPayload = {
            eventType,
            timestamp: new Date().toISOString(),
            data,
            metadata: {
                environment: process.env.NODE_ENV || 'development',
                version: '1.0'
            }
        };

        for (const subscription of subscriptions) {
            this.sendWebhook(subscription, payload);
        }
    }

    private async sendWebhook(
        subscription: WebhookSubscription,
        payload: WebhookPayload,
        retryCount = 0
    ): Promise<void> {
        try {
            const signature = this.generateSignature(payload, subscription.secret);

            await axios.post(subscription.url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Event-Type': payload.eventType
                },
                timeout: 5000 // 5 segundos timeout
            });

            // Actualizar estado exitoso
            await this.webhookRepository.update(subscription.id, {
                lastTriggeredAt: new Date(),
                failureCount: 0
            });

        } catch (error) {
            this.logger.error(`Error enviando webhook a ${subscription.url}: ${error.message}`);

            if (retryCount < this.MAX_RETRIES) {
                setTimeout(() => {
                    this.sendWebhook(subscription, payload, retryCount + 1);
                }, this.RETRY_DELAY * (retryCount + 1));
            } else {
                await this.handleWebhookFailure(subscription);
            }
        }
    }

    private generateSignature(payload: any, secret: string): string {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        return hmac.digest('hex');
    }

    private async handleWebhookFailure(subscription: WebhookSubscription): Promise<void> {
        subscription.failureCount++;

        if (subscription.failureCount >= 5) {
            subscription.isActive = false;
        }

        await this.webhookRepository.save(subscription);
    }

    async getSubscriptions(): Promise<WebhookSubscription[]> {
        return this.webhookRepository.find();
    }

    async updateSubscription(
        id: string,
        updates: Partial<WebhookSubscription>
    ): Promise<WebhookSubscription> {
        await this.webhookRepository.update(id, {
            ...updates,
            updatedAt: new Date()
        });

        return this.webhookRepository.findOne({ where: { id } });
    }

    async deleteSubscription(id: string): Promise<void> {
        await this.webhookRepository.delete(id);
    }

    async reactivateSubscription(id: string): Promise<WebhookSubscription> {
        return this.updateSubscription(id, {
            isActive: true,
            failureCount: 0
        });
    }
} 