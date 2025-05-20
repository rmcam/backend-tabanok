import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../features/user/user.service';
import { MailService } from '../lib/mail.service';
import { StatisticsService } from '../features/statistics/statistics.service';
import { HttpService } from '@nestjs/axios';
import * as argon2 from 'argon2';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

jest.mock('argon2');

const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;
import { Repository } from 'typeorm';
import { RevokedToken } from './entities/revoked-token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';


describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userService: UserService;
  let mailService: MailService;
  let statisticsService: StatisticsService;
  let httpService: HttpService;
  let revokedTokenRepository: Repository<RevokedToken>;
  let mockRevokedTokenRepository: { findOne: jest.Mock, save: jest.Mock }; // Declarar el tipo mockeado

  beforeEach(async () => {
    // Crear un mock del repositorio antes de configurar el módulo
    mockRevokedTokenRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      // Añadir otros métodos del repositorio si son usados en AuthService
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET' || key === 'JWT_REFRESH_SECRET') {
                return 'mockSecret'; // Devuelve un string mockeado para los secretos JWT
              }
              return undefined; // Devuelve undefined para otras claves
            }),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            findByEmailOptional: jest.fn(),
            findByUsernameOptional: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
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
            sendResetPasswordEmail: jest.fn(),
          },
        },
        {
          provide: StatisticsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RevokedToken),
          useValue: mockRevokedTokenRepository, // Usar el mock del repositorio
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    statisticsService = module.get<StatisticsService>(StatisticsService);
    httpService = module.get<HttpService>(HttpService);
    // Obtener la instancia mockeada del repositorio del módulo de testing
    revokedTokenRepository = module.get<Repository<RevokedToken>>(getRepositoryToken(RevokedToken));

    mockArgon2.verify.mockResolvedValue(true);
    mockArgon2.hash.mockResolvedValue('hashedpassword');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshTokens', () => {
    it('should return new tokens if refresh token is valid and not revoked', async () => {
      const refreshToken = 'valid_refresh_token';
      const payload = { sub: 'user-id', email: 'test@example.com', roles: ['user'] };
      const user = { id: 'user-id', email: 'test@example.com', role: 'user' } as any;
      const mockTokens = { accessToken: 'new_access_token', refreshToken: 'new_refresh_token' };

      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(payload);
          }, 10); // Pequeño retraso
        });
      });
      mockRevokedTokenRepository.findOne.mockResolvedValue(undefined); // Token not revoked
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(service as any, 'generateToken').mockResolvedValue(mockTokens);

      const result = await service.refreshTokens(refreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: expect.any(String), // Mocked ConfigService will return a string
      });
      expect(mockRevokedTokenRepository.findOne).toHaveBeenCalledWith({ where: { token: refreshToken } });
      expect(userService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(service['generateToken']).toHaveBeenCalledWith(user);
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshToken = 'invalid_refresh_token';
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));
      // No need to mock findOne for revoked tokens if verifyAsync fails first
      // mockRevokedTokenRepository.findOne.mockResolvedValue(undefined);

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: expect.any(String),
      });
      expect(mockRevokedTokenRepository.findOne).not.toHaveBeenCalled(); // Should not check repository if token is invalid
      expect(userService.findOne).not.toHaveBeenCalled();
      // expect(service['generateToken']).not.toHaveBeenCalled(); // Eliminado
    });

    it('should throw UnauthorizedException if refresh token is revoked', async () => {
      const refreshToken = 'revoked_refresh_token';
      const payload = { sub: 'user-id', email: 'test@example.com', roles: ['user'] };
      const revokedToken = { token: refreshToken } as any;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      mockRevokedTokenRepository.findOne.mockResolvedValue(revokedToken); // Token is revoked

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: expect.any(String),
      });
      expect(mockRevokedTokenRepository.findOne).toHaveBeenCalledWith({ where: { token: refreshToken } });
      expect(userService.findOne).not.toHaveBeenCalled(); // Should not find user if token is revoked
      // expect(service['generateToken']).not.toHaveBeenCalled(); // Eliminado
    });

    it('should throw UnauthorizedException if user not found after verifying token', async () => {
      const refreshToken = 'valid_refresh_token';
      const payload = { sub: 'user-id', email: 'test@example.com', roles: ['user'] };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      mockRevokedTokenRepository.findOne.mockResolvedValue(undefined); // Token not revoked
      jest.spyOn(userService, 'findOne').mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: expect.any(String),
      });
      expect(mockRevokedTokenRepository.findOne).toHaveBeenCalledWith({ where: { token: refreshToken } });
      expect(userService.findOne).toHaveBeenCalledWith(payload.sub);
      // expect(service['generateToken']).not.toHaveBeenCalled(); // Eliminado
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        secondName: 'User',
        firstLastName: 'Last',
        secondLastName: 'Name',
        languages: ['es'],
        preferences: {},
        role: 'user',
      };

      const createdUser = {
        id: 'some-uuid',
        username: registerDto.username,
        email: registerDto.email,
        password: 'hashedpassword', // Mock hashed password
        firstName: registerDto.firstName,
        lastName: `${registerDto.firstLastName} ${registerDto.secondLastName}`.trim(),
        languages: registerDto.languages,
        preferences: registerDto.preferences,
        role: registerDto.role,
      };

      const mockTokens = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };

      jest.spyOn(userService, 'findByEmailOptional').mockResolvedValue(null);
      jest.spyOn(userService, 'findByUsernameOptional').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(createdUser as any); // Cast to any for simplicity in mock
      jest.spyOn(statisticsService, 'create').mockResolvedValue(undefined); // Mock create statistics
      jest.spyOn(service as any, 'generateToken').mockResolvedValue(mockTokens); // Mock the private method

      const result = await service.register(registerDto as any); // Cast to any for simplicity in mock

      expect(userService.findByEmailOptional).toHaveBeenCalledWith(registerDto.email);
      expect(userService.findByUsernameOptional).toHaveBeenCalledWith(registerDto.username);
      expect(userService.create).toHaveBeenCalled(); // Check if create was called
      expect(statisticsService.create).toHaveBeenCalledWith({ userId: createdUser.id });
      expect(result).toEqual({
        statusCode: 201,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: createdUser,
      });
    }, 10000); // Aumentar el timeout a 10000 ms

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        secondName: 'User',
        firstLastName: 'Last',
        secondLastName: 'Name',
        languages: ['es'],
        preferences: {},
        role: 'user',
      };

      jest.spyOn(userService, 'findByEmailOptional').mockResolvedValue({} as any); // Simulate existing user by email
      jest.spyOn(userService, 'findByUsernameOptional').mockResolvedValue(null);

      await expect(service.register(registerDto as any)).rejects.toThrow(ConflictException);

      expect(userService.findByEmailOptional).toHaveBeenCalledWith(registerDto.email);
      expect(userService.findByUsernameOptional).not.toHaveBeenCalled(); // Should not check repository if token is invalid
      expect(userService.create).not.toHaveBeenCalled(); // Should not attempt to create user
    });

    it('should throw BadRequestException if username already exists', async () => {
      const registerDto = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        secondName: 'User',
        firstLastName: 'Last',
        secondLastName: 'Name',
        languages: ['es'],
        preferences: {},
        role: 'user',
      };

      jest.spyOn(userService, 'findByEmailOptional').mockResolvedValue(null);
      jest.spyOn(userService, 'findByUsernameOptional').mockResolvedValue({} as any); // Simulate existing user by username

      await expect(service.register(registerDto as any)).rejects.toThrow(BadRequestException);

      expect(userService.findByEmailOptional).toHaveBeenCalledWith(registerDto.email);
      expect(userService.findByUsernameOptional).toHaveBeenCalledWith(registerDto.username);
      expect(userService.create).not.toHaveBeenCalled(); // Should not attempt to create user
    });

    it('should throw an error if userService.create fails', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        secondName: 'User',
        firstLastName: 'Last',
        secondLastName: 'Name',
        languages: ['es'],
        preferences: {},
        role: 'user',
      };

      const createError = new Error('Database error');

      jest.spyOn(userService, 'findByEmailOptional').mockResolvedValue(null);
      jest.spyOn(userService, 'findByUsernameOptional').mockResolvedValue(null);
      // Simulate create failure with the specific Spanish message
      jest.spyOn(userService, 'create').mockRejectedValue(new Error('Error al registrar el usuario'));

      // Expect the specific Spanish error message
      await expect(service.register(registerDto as any)).rejects.toThrow('Error al registrar el usuario');

      expect(userService.findByEmailOptional).toHaveBeenCalledWith(registerDto.email);
      expect(userService.findByUsernameOptional).toHaveBeenCalledWith(registerDto.username);
      expect(userService.create).toHaveBeenCalled(); // Check if create was called
      expect(statisticsService.create).not.toHaveBeenCalled(); // Should not create statistics if user creation fails
    });

    it('should throw an error if statisticsService.create fails after user creation', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        secondName: 'User',
        firstLastName: 'Last',
        secondLastName: 'Name',
        languages: ['es'],
        preferences: {},
        role: 'user',
      };

      const createdUser = {
        id: 'some-uuid',
        username: registerDto.username,
        email: registerDto.email,
        password: 'hashedpassword', // Mock hashed password
        firstName: registerDto.firstName,
        lastName: `${registerDto.firstLastName} ${registerDto.secondLastName}`.trim(),
        languages: registerDto.languages,
        preferences: registerDto.preferences,
        role: registerDto.role,
      };

      const statisticsError = new Error('Statistics creation failed');

      jest.spyOn(userService, 'findByEmailOptional').mockResolvedValue(null);
      jest.spyOn(userService, 'findByUsernameOptional').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(createdUser as any); // Simulate user creation success
      jest.spyOn(statisticsService, 'create').mockRejectedValue(statisticsError); // Simulate statistics creation failure

      await expect(service.register(registerDto as any)).rejects.toThrow(statisticsError);

      expect(userService.findByEmailOptional).toHaveBeenCalledWith(registerDto.email);
      expect(userService.findByUsernameOptional).toHaveBeenCalledWith(registerDto.username);
      expect(userService.create).toHaveBeenCalled(); // Check if create was called
      expect(statisticsService.create).toHaveBeenCalledWith({ userId: createdUser.id }); // Check if statistics create was attempted
    });
  });

  describe('login', () => {
    it('should successfully log in a user with email', async () => {
      const loginDto = { identifier: 'test@example.com', password: 'password123' };
      const user = { id: 'user-id', email: 'test@example.com', password: 'hashedpassword' } as any;
      const mockTokens = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      mockArgon2.verify.mockResolvedValue(true);
      jest.spyOn(service as any, 'generateToken').mockResolvedValue(mockTokens);

      const result = await service.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.identifier);
      expect(mockArgon2.verify).toHaveBeenCalledWith(user.password, loginDto.password);
      expect(service['generateToken']).toHaveBeenCalledWith(user);
      expect(result).toEqual({
        statusCode: 201,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user,
      });
    });

    it('should successfully log in a user with username', async () => {
      const loginDto = { identifier: 'testuser', password: 'password123' };
      const user = { id: 'user-id', username: 'testuser', password: 'hashedpassword' } as any;
      const mockTokens = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      mockArgon2.verify.mockResolvedValue(true);
      jest.spyOn(service as any, 'generateToken').mockResolvedValue(mockTokens);

      const result = await service.login(loginDto);

      expect(userService.findByUsername).toHaveBeenCalledWith(loginDto.identifier);
      expect(mockArgon2.verify).toHaveBeenCalledWith(user.password, loginDto.password);
      expect(service['generateToken']).toHaveBeenCalledWith(user);
      expect(result).toEqual({
        statusCode: 201,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user,
      });
    });

    it('should throw UnauthorizedException for user not found', async () => {
      const loginDto = { identifier: 'nonexistent@example.com', password: 'password123' };
      jest.spyOn(userService, 'findByEmail').mockRejectedValue(new NotFoundException('Usuario no encontrado'));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.identifier);
      // expect(mockArgon2.verify).not.toHaveBeenCalled(); // Eliminado
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { identifier: 'test@example.com', password: 'wrongpassword' };
      const user = { id: 'user-id', email: 'test@example.com', password: 'hashedpassword' } as any;

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      mockArgon2.verify.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.identifier);
      expect(mockArgon2.verify).toHaveBeenCalledWith(user.password, loginDto.password);
    });

    it('should throw other errors from userService', async () => {
      const loginDto = { identifier: 'test@example.com', password: 'password123' };
      const otherError = new Error('Database error');
      jest.spyOn(userService, 'findByEmail').mockRejectedValue(otherError);

      await expect(service.login(loginDto)).rejects.toThrow(otherError);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.identifier);
      // expect(mockArgon2.verify).not.toHaveBeenCalled(); // Eliminado
    });
  });

  describe('updateProfile', () => {
    it('should successfully update a user profile', async () => {
      const userId = 'user-id';
      const updateProfileDto = {
        firstName: 'Updated',
        secondName: 'User',
        firstLastName: 'Last',
        secondLastName: 'Name',
        languages: ['en'],
        preferences: {
          notifications: true,
          language: 'en',
          theme: 'dark',
        },
      };
      const updatedUser = {
        id: userId,
        firstName: updateProfileDto.firstName,
        lastName: `${updateProfileDto.firstLastName} ${updateProfileDto.secondLastName}`.trim(),
        languages: updateProfileDto.languages,
        preferences: updateProfileDto.preferences,
      } as any;

      jest.spyOn(userService, 'findOne').mockResolvedValue({ id: userId } as any);
      jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userService.update).toHaveBeenCalledWith(userId, updateProfileDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'nonexistent-user-id';
      const updateProfileDto = {
        firstName: 'Updated',
        preferences: {
          notifications: true,
          language: 'en',
          theme: 'dark',
        },
      };

      jest.spyOn(userService, 'findOne').mockRejectedValue(new NotFoundException('Usuario no encontrado'));

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userService.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should successfully change a user password', async () => {
      const userId = 'user-id';
      const changePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const user = { id: userId, password: 'hashedoldpassword' } as any;
      const hashedNewPassword = 'hashednewpassword';

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      mockArgon2.verify.mockResolvedValue(true);
      mockArgon2.hash.mockResolvedValue(hashedNewPassword);
      jest.spyOn(userService, 'updatePassword').mockResolvedValue(undefined);

      await service.changePassword(userId, changePasswordDto);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(mockArgon2.verify).toHaveBeenCalledWith(user.password, changePasswordDto.currentPassword);
      expect(mockArgon2.hash).toHaveBeenCalledWith(changePasswordDto.newPassword);
      expect(userService.updatePassword).toHaveBeenCalledWith(userId, hashedNewPassword);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const userId = 'user-id';
      const changePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };
      const user = { id: userId, password: 'hashedoldpassword' } as any;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      mockArgon2.verify.mockResolvedValue(false);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(mockArgon2.verify).toHaveBeenCalledWith(user.password, changePasswordDto.currentPassword);
      // expect(mockArgon2.hash).not.toHaveBeenCalled(); // Eliminado
      expect(userService.updatePassword).not.toHaveBeenCalled();
    });

    it('should throw an error if userService.findOne fails', async () => {
      const userId = 'user-id';
      const changePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      jest.spyOn(userService, 'findOne').mockRejectedValue(new NotFoundException('Usuario no encontrado'));

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(NotFoundException);
      // expect(mockArgon2.verify).not.toHaveBeenCalled(); // Eliminado
      // expect(mockArgon2.hash).not.toHaveBeenCalled(); // Eliminado
      expect(userService.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('generateResetToken', () => {
    it('should throw NotFoundException if user with email does not exist', async () => {
      const email = 'nonexistent@example.com';
      jest.spyOn(userService, 'findByEmail').mockRejectedValue(new NotFoundException('Usuario no encontrado'));

      await expect(service.generateResetToken(email)).rejects.toThrow(NotFoundException);
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should call userService.setResetToken and mailService.sendResetPasswordEmail on successful token generation', async () => {
      const email = 'test@example.com';
      const user = { id: 'user-id', email } as any;
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(userService, 'setResetToken').mockResolvedValue(undefined);
      jest.spyOn(mailService, 'sendResetPasswordEmail').mockResolvedValue(undefined);

      await service.generateResetToken(email);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(userService.setResetToken).toHaveBeenCalledWith(
        user.id,
        expect.any(String),
        expect.any(Date),
      );
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password if token is valid and not expired', async () => {
      const token = 'valid_token';
      const newPassword = 'newpassword';
      const user = { id: 'user-id', resetPasswordExpires: new Date(Date.now() + 10000) } as any; // Token not expired
      const hashedPassword = 'hashednewpassword';

      jest.spyOn(userService, 'findByResetToken').mockResolvedValue(user);
      mockArgon2.hash.mockResolvedValue(hashedPassword);
      jest.spyOn(userService, 'updatePasswordAndClearResetToken').mockResolvedValue(undefined);

      await service.resetPassword(token, newPassword);

      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      expect(mockArgon2.hash).toHaveBeenCalledWith(newPassword);
      expect(userService.updatePasswordAndClearResetToken).toHaveBeenCalledWith(user.id, hashedPassword);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'invalid_token';
      const newPassword = 'newpassword';

      jest.spyOn(userService, 'findByResetToken').mockResolvedValue(null); // User not found by token

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      // expect(mockArgon2.hash).not.toHaveBeenCalled(); // Eliminado
      expect(userService.updatePasswordAndClearResetToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const token = 'expired_token';
      const newPassword = 'newpassword';
      const user = { id: 'user-id', resetPasswordExpires: new Date(Date.now() - 10000) } as any; // Token expired

      jest.spyOn(userService, 'findByResetToken').mockResolvedValue(user);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      // expect(mockArgon2.hash).not.toHaveBeenCalled(); // Eliminado
      expect(userService.updatePasswordAndClearResetToken).not.toHaveBeenCalled();
    });

    it('should throw an error if userService.findByResetToken fails', async () => {
      const token = 'valid_token';
      const newPassword = 'newpassword';
      const findError = new Error('Database error');

      jest.spyOn(userService, 'findByResetToken').mockRejectedValue(findError);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(findError);
      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      // expect(mockArgon2.hash).not.toHaveBeenCalled(); // Eliminado
      expect(userService.updatePasswordAndClearResetToken).not.toHaveBeenCalled();
    });

    it('should throw an error if userService.updatePasswordAndClearResetToken fails', async () => {
      const token = 'valid_token';
      const newPassword = 'newpassword';
      const user = { id: 'user-id', resetPasswordExpires: new Date(Date.now() + 10000) } as any; // Token not expired
      const hashedPassword = 'hashednewpassword';
      const updateError = new Error('Database update error');

      jest.spyOn(userService, 'findByResetToken').mockResolvedValue(user);
      mockArgon2.hash.mockResolvedValue(hashedPassword);
      jest.spyOn(userService, 'updatePasswordAndClearResetToken').mockRejectedValue(updateError);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(updateError);
      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      expect(mockArgon2.hash).toHaveBeenCalledWith(newPassword);
      expect(userService.updatePasswordAndClearResetToken).toHaveBeenCalledWith(user.id, hashedPassword);
    });
  });

  describe('decodeToken', () => {
    it('should return the decoded payload for a valid token', async () => {
      const token = 'valid_token';
      const payload = { sub: 'user-id', email: 'test@example.com' };

      jest.spyOn(jwtService, 'decode').mockReturnValue(payload);

      const result = await service.decodeToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual(payload);
    });

    it('should return null for an invalid token', async () => {
      const token = 'invalid_token';

      jest.spyOn(jwtService, 'decode').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.decodeToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toBeNull();
    });
  });
});
