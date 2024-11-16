import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes(
    //   {
    //     path: 'users',
    //     method: RequestMethod.GET,
    //   },
    //   {
    //     path: 'users',
    //     method: RequestMethod.POST,
    //   },
    // ).apply(AuthMiddleware).forRoutes('users');
  }
}
