import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../auth/entities/user.entity';
import { NotificationController } from './controllers/notification.controller';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, User])
    ],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService]
})
export class NotificationsModule { }
