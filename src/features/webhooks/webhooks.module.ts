import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhooksService } from './webhooks.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([WebhookSubscription])
    ],
    providers: [WebhooksService],
    exports: [WebhooksService]
})
export class WebhooksModule { } 