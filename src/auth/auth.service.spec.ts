import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../features/user/user.service';
import { MailService } from '../lib/mail.service';
import { StatisticsService } from '../features/statistics/statistics.service';
import { HttpService } from '@nestjs/axios';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userService: UserService;
  let mailService: MailService;
  let statisticsService: StatisticsService;
  let httpService: HttpService;

  beforeEach(async () => {
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
            get: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    statisticsService = module.get<StatisticsService>(StatisticsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: Add tests for refreshTokens method
  // TODO: Add tests for register method
  // TODO: Add tests for login method
  // TODO: Add tests for updateProfile method
  // TODO: Add tests for changePassword method
  // TODO: Add tests for generateResetToken method
  // TODO: Add tests for resetPassword method
  // TODO: Add tests for generateToken method (private method, might need a different approach or test through public methods)
  // TODO: Add tests for decodeToken method

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

      await expect(service.register(registerDto as any)).rejects.toThrow(
        new Error('El correo electrónico ya está registrado'), // Updated message
      );

      expect(userService.findByEmailOptional).toHaveBeenCalledWith(registerDto.email);
      expect(userService.findByUsernameOptional).not.toHaveBeenCalled(); // Should not check username if email exists
      expect(userService.create).not.toHaveBeenCalled(); // Should not attempt to create user
    });

    it('should throw ConflictException if username already exists', async () => {
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

      await expect(service.register(registerDto as any)).rejects.toThrow(
        new Error('El nombre de usuario ya está registrado'), // Updated message
      );

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
});
