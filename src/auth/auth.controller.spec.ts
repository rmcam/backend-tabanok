import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { LoginDto, RegisterDto, ChangePasswordDto, RequestPasswordResetDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from './enums/auth.enum'; // Importar los enums

// Mock para AuthService
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  validateToken: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
  refreshTokens: jest.fn(),
};

// Mock para Response de Express
const mockResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
} as unknown as Response;


describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        // Proveedores necesarios para Guards si se usan globalmente o en tests específicos
        Reflector, // Necesario para RolesGuard
        // Mock JwtAuthGuard si es necesario para tests específicos
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) }, // Mock simple que siempre permite el acceso
        },
        // Mock RolesGuard si es necesario para tests específicos
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) }, // Mock simple que siempre permite el acceso
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Resetear mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Aquí se añadirán las pruebas para cada endpoint del controlador
  describe('POST /signin', () => {
    it('should call authService.login and set cookies on successful login', async () => {
      const loginDto: LoginDto = { identifier: 'test@example.com', password: 'password123' };
      const mockTokens = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };
      mockAuthService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(loginDto, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith('accessToken', mockTokens.accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
      expect(result).toEqual({ message: 'Login successful' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = { identifier: 'test@example.com', password: 'wrongpassword' };
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for other errors during login', async () => {
      const loginDto: LoginDto = { identifier: 'test@example.com', password: 'password123' };
      mockAuthService.login.mockRejectedValue(new Error('Some other error'));

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(BadRequestException);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('POST /signup', () => {
    it('should call authService.register on successful registration', async () => {
      const registerDto: RegisterDto = { email: 'newuser@example.com', password: 'password123', username: 'newuser', firstName: 'New', firstLastName: 'User', secondName: '', secondLastName: '', languages: [], preferences: { notifications: true, language: 'en', theme: 'dark' }, role: undefined };
      // Corregir mockUser para que coincida con la entidad User
      const mockUser: User = {
        id: 'uuid-test-user', // Usar un ID de prueba
        username: registerDto.username,
        email: registerDto.email,
        password: 'hashedpassword', // La contraseña se hashea en el servicio, usar un valor mockeado
        firstName: registerDto.firstName,
        lastName: `${registerDto.firstLastName} ${registerDto.secondLastName}`.trim(), // Combinar apellidos
        role: registerDto.role || UserRole.USER, // Usar el rol del DTO o el default
        status: UserStatus.ACTIVE, // Estado por defecto
        languages: registerDto.languages || [],
        preferences: registerDto.preferences || { notifications: true, language: 'en', theme: 'dark' },
        level: 1, // Nivel por defecto
        points: 0, // Puntos por defecto
        culturalPoints: 0, // Puntos culturales por defecto
        gameStats: { totalPoints: 0, level: 1, lessonsCompleted: 0, exercisesCompleted: 0, perfectScores: 0 }, // Estadísticas por defecto
        resetPasswordToken: null,
        resetPasswordExpires: null,
        lastLoginAt: null,
        isEmailVerified: false,
        accounts: [], // Relación vacía
        userRewards: [], // Relación vacía
        userAchievements: [], // Relación vacía
        progress: [], // Relación vacía
        leaderboards: [], // Relación vacía
        statistics: null, // Relación vacía o mockeada si es necesario
        unities: [], // Relación vacía
        createdAt: new Date(),
        activities: [], // Relación vacía
        updatedAt: new Date(),
      };
      mockAuthService.register.mockResolvedValue({ statusCode: 201, accessToken: 'token', refreshToken: 'refreshToken', user: mockUser });

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({ statusCode: 201, accessToken: 'token', refreshToken: 'refreshToken', user: mockUser });
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = { email: 'existing@example.com', password: 'password123', username: 'existinguser', firstName: 'Existing', firstLastName: 'User', secondName: '', secondLastName: '', languages: [], preferences: { notifications: true, language: 'en', theme: 'dark' }, role: undefined };
      mockAuthService.register.mockRejectedValue(new ConflictException('User already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException for invalid registration data', async () => {
      const registerDto: RegisterDto = { email: 'invalid-email', password: 'password123', username: 'newuser', firstName: 'New', firstLastName: 'User', secondName: '', secondLastName: '', languages: [], preferences: { notifications: true, language: 'en', theme: 'dark' }, role: undefined };
      mockAuthService.register.mockRejectedValue(new BadRequestException('Invalid data'));

      await expect(controller.register(registerDto)).rejects.toThrow(BadRequestException);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('GET /profile', () => {
    it('should return the user profile from the request object', async () => {
      const mockUser = { id: 'uuid', email: 'test@example.com' } as User;
      const mockRequest = { user: mockUser };

      const result = await controller.getProfile(mockRequest);

      expect(result).toBe(mockUser);
    });
  });

  describe('GET /validate', () => {
    it('should call authService.validateToken and return isValid true for a valid token', async () => {
      const mockToken = 'validToken';
      const mockPayload = { sub: 'uuid', email: 'test@example.com' };
      mockAuthService.validateToken.mockResolvedValue(mockPayload);
      const mockHeaders = { authorization: `Bearer ${mockToken}` };
      const mockRequest = { headers: mockHeaders };

      const result = await controller.validateToken(mockHeaders.authorization);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual({ isValid: true });
    });

    it('should return isValid false for a missing token', async () => {
      const mockHeaders = {};
      const mockRequest = { headers: mockHeaders };

      const result = await controller.validateToken(undefined);

      expect(mockAuthService.validateToken).not.toHaveBeenCalled();
      expect(result).toEqual({ isValid: false });
    });

    it('should return isValid false for an invalid token', async () => {
      const mockToken = 'invalidToken';
      mockAuthService.validateToken.mockResolvedValue(null);
      const mockHeaders = { authorization: `Bearer ${mockToken}` };
      const mockRequest = { headers: mockHeaders };

      const result = await controller.validateToken(mockHeaders.authorization);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual({ isValid: false });
    });
  });

  describe('PUT /profile', () => {
    it('should call authService.updateProfile with user id and update data', async () => {
      const mockUser = { id: 'uuid', email: 'test@example.com' } as User;
      // Corregir updateProfileDto para usar 'lastName' en lugar de 'firstLastName'
      const updateProfileDto: UpdateProfileDto = { firstName: 'Updated', lastName: 'User' };
      const mockRequest = { user: mockUser };
      // El resultado de updateProfile debe ser un objeto User completo, no solo el DTO
      const updatedUser: User = {
        ...mockUser,
        firstName: updateProfileDto.firstName || mockUser.firstName,
        lastName: updateProfileDto.lastName || mockUser.lastName,
        // Añadir otras propiedades actualizables si es necesario
      };
      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockRequest, updateProfileDto);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(mockUser.id, updateProfileDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('POST /password/change', () => {
    it('should call authService.changePassword with user id and password data', async () => {
      const mockUser = { id: 'uuid', email: 'test@example.com' } as User;
      const changePasswordDto: ChangePasswordDto = { currentPassword: 'oldpassword', newPassword: 'newpassword' };
      const mockRequest = { user: mockUser };
      mockAuthService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(mockRequest, changePasswordDto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(mockUser.id, changePasswordDto);
      expect(result).toBeUndefined(); // Assuming changePassword returns void or undefined
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      const mockUser = { id: 'uuid', email: 'test@example.com' } as User;
      const changePasswordDto: ChangePasswordDto = { currentPassword: 'wrongpassword', newPassword: 'newpassword' };
      const mockRequest = { user: mockUser };
      mockAuthService.changePassword.mockRejectedValue(new BadRequestException('Incorrect current password'));

      await expect(controller.changePassword(mockRequest, changePasswordDto)).rejects.toThrow(BadRequestException);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(mockUser.id, changePasswordDto);
    });
  });

  describe('POST /password/reset/request', () => {
    it('should call authService.requestPasswordReset', async () => {
      const requestPasswordResetDto: RequestPasswordResetDto = { email: 'test@example.com' };
      mockAuthService.requestPasswordReset.mockResolvedValue(undefined);

      const result = await controller.requestPasswordReset(requestPasswordResetDto);

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(requestPasswordResetDto);
      expect(result).toBeUndefined(); // Assuming requestPasswordReset returns void or undefined
    });

    it('should throw NotFoundException if user not found', async () => {
      const requestPasswordResetDto: RequestPasswordResetDto = { email: 'nonexistent@example.com' };
      mockAuthService.requestPasswordReset.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.requestPasswordReset(requestPasswordResetDto)).rejects.toThrow(NotFoundException);
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(requestPasswordResetDto);
    });
  });

  describe('POST /reset-password', () => {
    it('should call authService.resetPassword', async () => {
      const resetPasswordDto: ResetPasswordDto = { token: 'resettoken', newPassword: 'newpassword' };
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetPasswordDto.token, resetPasswordDto.newPassword);
      expect(result).toBeUndefined(); // Assuming resetPassword returns void or undefined
    });
  });

  describe('POST /refresh', () => {
    it('should call authService.refreshTokens and set new cookies', async () => {
      const mockRefreshToken = 'oldRefreshToken';
      const mockNewTokens = { accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' };
      const mockRequest = { cookies: { refreshToken: mockRefreshToken } };
      mockAuthService.refreshTokens.mockResolvedValue(mockNewTokens);

      const result = await controller.refreshTokens(mockRequest, mockResponse);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockResponse.cookie).toHaveBeenCalledWith('accessToken', mockNewTokens.accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', mockNewTokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
      expect(result).toEqual({ message: 'Tokens refreshed successfully' });
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      const mockRequest = { cookies: {} };

      await expect(controller.refreshTokens(mockRequest, mockResponse)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.refreshTokens).not.toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is invalid or expired', async () => {
      const mockRefreshToken = 'invalidRefreshToken';
      const mockRequest = { cookies: { refreshToken: mockRefreshToken } };
      mockAuthService.refreshTokens.mockRejectedValue(new UnauthorizedException('Refresh token invalid or expired'));

      await expect(controller.refreshTokens(mockRequest, mockResponse)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('GET /verify-session', () => {
    it('should return the user from the request object if JwtAuthGuard passes', async () => {
      const mockUser = { id: 'uuid', email: 'test@example.com' } as User;
      const mockRequest = { user: mockUser };

      const result = await controller.verifySession(mockRequest);

      expect(result).toBe(mockUser);
    });
  });

  describe('POST /signout', () => {
    it('should clear access and refresh token cookies', async () => {
      const mockRequest = {}; // Request object is not used in the controller method
      mockAuthService.refreshTokens.mockResolvedValue(undefined); // Mock any potential calls if the service were used

      const result = await controller.signout(mockRequest, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(result).toEqual({ message: 'Signout successful' });
    });
  });
});
