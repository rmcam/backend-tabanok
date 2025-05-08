import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/auth.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../features/user/user.service';
import { MailService } from '../lib/mail.service';
import { StatisticsService } from '../features/statistics/statistics.service';
import { HttpService } from '@nestjs/axios';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(RevokedToken),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_ACCESS_TOKEN_SECRET') return 'test_access_secret';
              if (key === 'JWT_ACCESS_TOKEN_EXPIRATION_TIME') return '3600s';
              if (key === 'JWT_REFRESH_TOKEN_SECRET') return 'test_refresh_secret';
              if (key === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME') return '7d';
              return null;
            }),
          },
        },
        {
          provide: UserService,
          useValue: {
            // Mock methods of UserService used by AuthService
            findByEmailOptional: jest.fn(),
            findByUsernameOptional: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updatePassword: jest.fn(),
            setResetToken: jest.fn(),
            findByResetToken: jest.fn(),
            updatePasswordAndClearResetToken: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            // Mock methods of MailService used by AuthService
            sendResetPasswordEmail: jest.fn(),
          },
        },
        {
          provide: StatisticsService,
          useValue: {
            // Mock methods of StatisticsService used by AuthService
            create: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            // Mock methods of HttpService used by AuthService
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and set cookies on successful login', async () => {
      const loginDto = { identifier: 'test@example.com', password: 'password' };
      const tokens = { accessToken: 'access_token', refreshToken: 'refresh_token' };
      const res = {
        cookie: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as any;

      jest.spyOn(authService, 'login').mockResolvedValue(tokens);

      const result = await controller.login(loginDto, res);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(res.cookie).toHaveBeenCalledWith('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      expect(result).toEqual({ message: 'Login successful' });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto: LoginDto = { identifier: 'test@example.com', password: 'wrongpassword' };
      const res = {
        cookie: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as any;

      jest.spyOn(authService, 'login').mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await expect(controller.login(loginDto, res)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for other errors during login', async () => {
      const loginDto: LoginDto = { identifier: 'test@example.com', password: 'password' };
      const res = {
        cookie: jest.fn(),
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as any;

      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Some other error'));

      await expect(controller.login(loginDto, res)).rejects.toThrow(BadRequestException);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  // Agrega más pruebas aquí para los métodos del controlador
});
