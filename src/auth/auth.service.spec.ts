// Explicit mock functions for argon2
const mockArgon2Hash = jest.fn();
const mockArgon2Verify = jest.fn();

import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { StatisticsService } from "../features/statistics/statistics.service";
import { UserService } from "../features/user/user.service";
import { MailService } from "../lib/mail.service";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { User } from "./entities/user.entity";

// Mock the entire argon2 module using the explicit mock functions
jest.mock("argon2", () => ({
  hash: mockArgon2Hash,
  verify: mockArgon2Verify,
}));

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let mailService: MailService;
  let statisticsService: StatisticsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, // Provide the actual AuthService
        {
          provide: UserService,
          useValue: {
            findByEmailOptional: jest.fn(),
            findByUsernameOptional: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updatePassword: jest.fn(),
            setResetToken: jest.fn(),
            findByResetToken: jest.fn(),
            updatePasswordAndClearResetToken: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
          },
        },
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
              if (key === "JWT_SECRET") return "testsecret";
              if (key === "JWT_EXPIRATION") return "1d";
              if (key === "JWT_REFRESH_SECRET") return "testrefreshsecret";
              if (key === "JWT_REFRESH_EXPIRATION") return "7d";
              return null;
            }),
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
            // Mock any methods used by AuthService if necessary
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService); // Get the actual AuthService instance
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    mailService = module.get<MailService>(MailService);
    statisticsService = module.get<StatisticsService>(StatisticsService);
    httpService = module.get<HttpService>(HttpService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("register", () => {
    it("should create a new user and return tokens", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        firstName: "Test",
        firstLastName: "User",
        secondName: "",
        secondLastName: "",
        languages: [],
        preferences: { notifications: true, language: "en", theme: "dark" },
        role: undefined,
      };
      const hashedPassword = "hashedpassword";
      const mockUser = {
        id: "1",
        email: registerDto.email,
        password: hashedPassword,
        username: registerDto.username,
        firstName: registerDto.firstName,
        lastName:
          `${registerDto.firstLastName} ${registerDto.secondLastName}`.trim(),
        languages: registerDto.languages,
        preferences: registerDto.preferences,
        role: registerDto.role,
      } as User;
      const mockTokens = {
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
      };

      userService.findByEmailOptional = jest.fn().mockResolvedValue(null);
      userService.findByUsernameOptional = jest.fn().mockResolvedValue(null);
      mockArgon2Hash.mockResolvedValue(hashedPassword);
      userService.create = jest.fn().mockResolvedValue(mockUser);
      statisticsService.create = jest.fn().mockResolvedValue(undefined);
      jest
        .spyOn(authService as any, "generateToken")
        .mockResolvedValue(mockTokens); // Spy on the private method

      const result = await authService.register(registerDto);

      expect(userService.findByEmailOptional).toHaveBeenCalledWith(
        registerDto.email
      );
      expect(userService.findByUsernameOptional).toHaveBeenCalledWith(
        registerDto.username
      );
      expect(mockArgon2Hash).toHaveBeenCalledWith(registerDto.password);
      expect(userService.create).toHaveBeenCalledWith({
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName:
          `${registerDto.firstLastName} ${registerDto.secondLastName}`.trim(),
        languages: registerDto.languages,
        preferences: registerDto.preferences,
        role: registerDto.role,
      });
      expect(statisticsService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      expect(authService["generateToken"]).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        statusCode: 201,
        ...mockTokens,
        user: mockUser,
      });
    });

    it("should throw ConflictException if email already exists", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        firstName: "Test",
        firstLastName: "User",
        secondName: "",
        secondLastName: "",
        languages: [],
        preferences: { notifications: true, language: "en", theme: "dark" },
        role: undefined,
      };
      const mockUser = { id: "1", email: registerDto.email } as User;

      userService.findByEmailOptional = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException
      );
      expect(userService.findByEmailOptional).toHaveBeenCalledWith(
        registerDto.email
      );
      expect(userService.findByUsernameOptional).not.toHaveBeenCalled();
      expect(mockArgon2Hash).not.toHaveBeenCalled();
      expect(userService.create).not.toHaveBeenCalled();
      expect(statisticsService.create).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if username already exists", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        firstName: "Test",
        firstLastName: "User",
        secondName: "",
        secondLastName: "",
        languages: [],
        preferences: { notifications: true, language: "en", theme: "dark" },
        role: undefined,
      };
      const mockUser = { id: "1", username: registerDto.username } as User;

      userService.findByEmailOptional = jest.fn().mockResolvedValue(null);
      userService.findByUsernameOptional = jest
        .fn()
        .mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException
      );
      expect(userService.findByEmailOptional).toHaveBeenCalledWith(
        registerDto.email
      );
      expect(userService.findByUsernameOptional).toHaveBeenCalledWith(
        registerDto.username
      );
      expect(mockArgon2Hash).not.toHaveBeenCalled();
      expect(userService.create).not.toHaveBeenCalled();
      expect(statisticsService.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    let mockTokens: { accessToken: string; refreshToken: string };

    beforeEach(() => {
      // Spy on the private method generateToken before each test in this block
      jest.spyOn(authService as any, 'generateToken');
      mockTokens = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };
    });

    it("should return tokens for valid credentials (email)", async () => {
      const loginDto: LoginDto = {
        identifier: "test@example.com",
        password: "password123",
      };
      const hashedPassword = "hashedpassword";
      const mockUser = {
        id: "1",
        email: loginDto.identifier,
        password: hashedPassword,
      } as User;
      // mockTokens is now defined in beforeEach

      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      mockArgon2Verify.mockResolvedValue(true); // Ensure mockArgon2Verify is reset for this test
      // jest.spyOn(authService as any, "generateToken").mockResolvedValue(mockTokens); // Removed, handled by beforeEach
      (authService as any)['generateToken'].mockResolvedValue(mockTokens); // Use the spy set up in beforeEach

      const result = await authService.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.identifier);
      expect(userService.findByUsername).not.toHaveBeenCalled(); // Corrected assertion
      expect(mockArgon2Verify).toHaveBeenCalledWith(
        mockUser.password,
        loginDto.password
      );
      expect(authService["generateToken"]).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        statusCode: 201,
        ...mockTokens,
        user: mockUser,
      });
    });

    it("should throw UnauthorizedException for invalid email identifier", async () => {
      const loginDto: LoginDto = {
        identifier: "nonexistent@example.com",
        password: "password123",
      };

      userService.findByEmail = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.identifier);
      expect(userService.findByUsername).not.toHaveBeenCalled(); // Should not be called if identifier looks like email
      expect(mockArgon2Verify).not.toHaveBeenCalled();
      expect(authService["generateToken"]).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException for invalid username identifier", async () => {
      const loginDto: LoginDto = {
        identifier: "nonexistentuser",
        password: "password123",
      };

      userService.findByEmail = jest
        .fn()
        .mockRejectedValue(new NotFoundException()); // Mock findByEmail to throw
      userService.findByUsername = jest
        .fn()
        .mockRejectedValue(new NotFoundException()); // Mock findByUsername to also throw

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(userService.findByEmail).not.toHaveBeenCalled(); // Should not be called if identifier is username
      expect(userService.findByUsername).toHaveBeenCalledWith(
        loginDto.identifier
      ); // Should be called after findByEmail throws
      expect(mockArgon2Verify).not.toHaveBeenCalled();
      expect(authService["generateToken"]).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const loginDto: LoginDto = {
        identifier: "test@example.com",
        password: "wrongpassword",
      };
      const hashedPassword = "hashedpassword";
      const mockUser = {
        id: "1",
        email: loginDto.identifier,
        password: hashedPassword,
      } as User;

      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      mockArgon2Verify.mockResolvedValue(false);
      // jest.spyOn(authService as any, "generateToken").mockResolvedValue({ accessToken: "mockAccessToken", refreshToken: "mockRefreshToken" }); // Removed, handled by beforeEach
      (authService as any)['generateToken'].mockResolvedValue({
          accessToken: "mockAccessToken",
          refreshToken: "mockRefreshToken",
        }); // Use the spy set up in beforeEach

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.identifier);
      expect(userService.findByUsername).not.toHaveBeenCalled();
      expect(mockArgon2Verify).toHaveBeenCalledWith(
        mockUser.password,
        loginDto.password
      );
      expect(authService["generateToken"]).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    let generateTokenSpy: jest.SpyInstance; // Declare a variable to hold the spy

    beforeEach(() => {
      // Spy on the private method generateToken and store the spy instance
      generateTokenSpy = jest.spyOn(authService as any, 'generateToken');
    });

    it('should return new tokens for a valid refresh token', async () => {
      const refreshToken = 'validRefreshToken';
      const mockPayload = { sub: 'user-id', email: 'test@example.com' };
      const mockUser = { id: 'user-id', email: 'test@example.com' } as User;
      const mockNewTokens = { accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' };

      jwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);
      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      // Use the stored spy instance to mock the implementation
      generateTokenSpy.mockResolvedValue(mockNewTokens);

      const result = await authService.refreshTokens(refreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'testrefreshsecret', // Assuming JWT_REFRESH_SECRET is set
      });
      expect(userService.findOne).toHaveBeenCalledWith(mockPayload.sub);
      expect(generateTokenSpy).toHaveBeenCalledWith(mockUser); // Use the spy instance for assertion
      expect(result).toEqual(mockNewTokens);
    });

    it('should throw UnauthorizedException for an invalid or expired refresh token', async () => {
      const refreshToken = 'invalidRefreshToken';

      jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));

      await expect(authService.refreshTokens(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'testrefreshsecret', // Assuming JWT_REFRESH_SECRET is set
      });
      expect(userService.findOne).not.toHaveBeenCalled();
      expect(generateTokenSpy).not.toHaveBeenCalled(); // Use the spy instance for assertion
    });
  });

  describe('updateProfile', () => {
    it('should call userService.findOne and userService.update with correct parameters', async () => {
      const userId = 'test-user-id';
      const updateProfileDto = { firstName: 'Updated', lastName: 'User' };
      const mockUser = { id: userId, email: 'test@example.com' } as User;
      const updatedUser = { ...mockUser, ...updateProfileDto } as User;

      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      userService.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(userId, updateProfileDto);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userService.update).toHaveBeenCalledWith(userId, updateProfileDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'nonexistent-user-id';
      const updateProfileDto = { firstName: 'Updated', lastName: 'User' };

      userService.findOne = jest.fn().mockRejectedValue(new NotFoundException());

      await expect(authService.updateProfile(userId, updateProfileDto)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(userService.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should call userService.findOne, argon2.verify, argon2.hash, and userService.updatePassword with correct parameters on successful password change', async () => {
      const userId = 'test-user-id';
      const changePasswordDto = { currentPassword: 'oldpassword', newPassword: 'newpassword' };
      const mockUser = { id: userId, password: 'hashedoldpassword' } as User;
      const hashedPassword = 'hashednewpassword';

      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      mockArgon2Verify.mockResolvedValue(true);
      mockArgon2Hash.mockResolvedValue(hashedPassword);
      userService.updatePassword = jest.fn().mockResolvedValue(undefined);

      await authService.changePassword(userId, changePasswordDto);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(mockArgon2Verify).toHaveBeenCalledWith(mockUser.password, changePasswordDto.currentPassword);
      expect(mockArgon2Hash).toHaveBeenCalledWith(changePasswordDto.newPassword);
      expect(userService.updatePassword).toHaveBeenCalledWith(userId, hashedPassword);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const userId = 'test-user-id';
      const changePasswordDto = { currentPassword: 'wrongpassword', newPassword: 'newpassword' };
      const mockUser = { id: userId, password: 'hashedoldpassword' } as User;

      userService.findOne = jest.fn().mockResolvedValue(mockUser);
      mockArgon2Verify.mockResolvedValue(false);

      await expect(authService.changePassword(userId, changePasswordDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(mockArgon2Verify).toHaveBeenCalledWith(mockUser.password, changePasswordDto.currentPassword);
      expect(mockArgon2Hash).not.toHaveBeenCalled();
      expect(userService.updatePassword).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'nonexistent-user-id';
      const changePasswordDto = { currentPassword: 'oldpassword', newPassword: 'newpassword' };

      userService.findOne = jest.fn().mockRejectedValue(new NotFoundException());

      await expect(authService.changePassword(userId, changePasswordDto)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(mockArgon2Verify).not.toHaveBeenCalled();
      expect(mockArgon2Hash).not.toHaveBeenCalled();
      expect(userService.updatePassword).not.toHaveBeenCalled();
    });
  });

  describe('generateResetToken', () => {
    it('should call userService.findByEmail, userService.setResetToken, and mailService.sendResetPasswordEmail on successful token generation', async () => {
      const email = 'test@example.com';
      const mockUser = { id: 'user-id', email: email } as User;

      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      userService.setResetToken = jest.fn().mockResolvedValue(undefined);
      mailService.sendResetPasswordEmail = jest.fn().mockResolvedValue(undefined);

      await authService.generateResetToken(email);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(userService.setResetToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String), // Expecting a generated token string
        expect.any(Date), // Expecting an expiration date
      );
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String), // Expecting the generated token string
      );
    });

    it('should not throw NotFoundException if user does not exist', async () => {
      const email = 'nonexistent@example.com';

      userService.findByEmail = jest.fn().mockRejectedValue(new NotFoundException());
      // No expect toThrow here, as the service method handles NotFoundException internally

      await authService.generateResetToken(email);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(userService.setResetToken).not.toHaveBeenCalled();
      expect(mailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });

    it('should re-throw other errors from userService.findByEmail', async () => {
      const email = 'test@example.com';
      const mockError = new Error('Some other error');

      userService.findByEmail = jest.fn().mockRejectedValue(mockError);

      await expect(authService.generateResetToken(email)).rejects.toThrow(mockError);
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(userService.setResetToken).not.toHaveBeenCalled();
      expect(mailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should return the payload for a valid token', async () => {
      const token = 'validToken';
      const mockPayload = { sub: 'user-id', email: 'test@example.com' };

      jwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

      const result = await authService.validateToken(token);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'testsecret', // Assuming JWT_SECRET is set
      });
      expect(result).toEqual(mockPayload);
    });

    it('should return null for an invalid token', async () => {
      const token = 'invalidToken';

      jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));

      const result = await authService.validateToken(token);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'testsecret', // Assuming JWT_SECRET is set
      });
      expect(result).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should call userService.findByResetToken, argon2.hash, and userService.updatePasswordAndClearResetToken on successful password reset', async () => {
      const token = 'resettoken';
      const newPassword = 'newpassword';
      const mockUser = { id: 'user-id', resetPasswordToken: token, resetPasswordExpires: new Date(Date.now() + 100000) } as User; // Token not expired
      const hashedPassword = 'hashednewpassword';

      userService.findByResetToken = jest.fn().mockResolvedValue(mockUser);
      mockArgon2Hash.mockResolvedValue(hashedPassword);
      userService.updatePasswordAndClearResetToken = jest.fn().mockResolvedValue(undefined);

      await authService.resetPassword(token, newPassword);

      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      expect(mockArgon2Hash).toHaveBeenCalledWith(newPassword);
      expect(userService.updatePasswordAndClearResetToken).toHaveBeenCalledWith(mockUser.id, hashedPassword);
    });

    it('should throw UnauthorizedException if token is invalid or expired', async () => {
      const token = 'invalidtoken';
      const newPassword = 'newpassword';

      userService.findByResetToken = jest.fn().mockResolvedValue(null); // User not found by token

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      expect(mockArgon2Hash).not.toHaveBeenCalled();
      expect(userService.updatePasswordAndClearResetToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token has expired', async () => {
      const token = 'expiredtoken';
      const newPassword = 'newpassword';
      const mockUser = { id: 'user-id', resetPasswordToken: token, resetPasswordExpires: new Date(Date.now() - 100000) } as User; // Token expired

      userService.findByResetToken = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByResetToken).toHaveBeenCalledWith(token);
      expect(mockArgon2Hash).not.toHaveBeenCalled();
      expect(userService.updatePasswordAndClearResetToken).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should return the payload for a valid token', async () => {
      const token = 'validToken';
      const mockPayload = { sub: 'user-id', email: 'test@example.com' };

      jwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

      const result = await authService.verifyToken(token);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'testsecret', // Assuming JWT_SECRET is set
      });
      expect(result).toEqual(mockPayload);
    });

    it('should return null for an invalid token', async () => {
      const token = 'invalidToken';

      jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));

      const result = await authService.verifyToken(token);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'testsecret', // Assuming JWT_SECRET is set
      });
      expect(result).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('should return the decoded payload for a valid token', async () => {
      const token = 'validToken';
      const mockPayload = { sub: 'user-id', email: 'test@example.com' };

      jwtService.decode = jest.fn().mockReturnValue(mockPayload);

      const result = await authService.decodeToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockPayload);
    });

    it('should return null for an invalid token', async () => {
      const token = 'invalidToken';

      jwtService.decode = jest.fn().mockReturnValue(null); // jwt.decode returns null for invalid tokens

      const result = await authService.decodeToken(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toBeNull();
    });
  });

  // Add tests for requestPasswordReset
  describe('requestPasswordReset', () => {
    it('should call generateResetToken with the correct email', async () => {
      const requestPasswordResetDto = { email: 'test@example.com' };
      // Spy on the private method generateResetToken
      const generateResetTokenSpy = jest.spyOn(authService as any, 'generateResetToken').mockResolvedValue(undefined);

      await authService.requestPasswordReset(requestPasswordResetDto);

      expect(generateResetTokenSpy).toHaveBeenCalledWith(requestPasswordResetDto.email);
    });
  });
});
