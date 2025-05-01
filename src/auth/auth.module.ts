import { HttpModule } from "@nestjs/axios";
import { Module, forwardRef } from "@nestjs/common"; // Importar forwardRef
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityModule } from "../features/activity/activity.module";
import { GamificationModule } from "../features/gamification/gamification.module";
import { StatisticsModule } from "../features/statistics/statistics.module";
import { StatisticsService } from "../features/statistics/statistics.service";
import { UserModule } from "../features/user/user.module";
import { MailModule } from "../lib/mail.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "./entities/user.entity"; // Ruta corregida
import { RolesGuard } from "./guards/roles.guard";
import { UserRepository } from "./repositories/user.repository";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRATION") || "1d",
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
    MailModule,
    HttpModule,
    forwardRef(() => GamificationModule), // Usar forwardRef para la dependencia circular
    ActivityModule,
    StatisticsModule, // Importar StatisticsModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    StatisticsService,
    RolesGuard,
    JwtStrategy,
    UserRepository, // Añadir UserRepository a los providers
  ],
  exports: [
    JwtModule,
    AuthService,
    RolesGuard,
    JwtStrategy,
    TypeOrmModule.forFeature([User]), // Exportar el repositorio estándar
    UserRepository, // Añadir UserRepository a los exports
  ],
})
export class AuthModule {}
