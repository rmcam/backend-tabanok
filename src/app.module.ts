import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HelloController } from './hello/hello.controller';
import { PaymentsModule } from './payments/payments.module';
import { PrismaService } from './prisma.service';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TasksModule,
    ProjectsModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
  ],
  controllers: [HelloController],
  providers: [PrismaService],
})
export class AppModule {}
