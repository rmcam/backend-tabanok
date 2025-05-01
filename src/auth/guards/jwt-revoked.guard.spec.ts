import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtRevokedGuard } from './jwt-revoked.guard';
import { RevokedToken } from '../entities/revoked-token.entity';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('JwtRevokedGuard', () => {
  let guard: JwtRevokedGuard;
  let mockJwtService: Partial<JwtService>;
  let mockRevokedTokenRepository: Partial<Repository<RevokedToken>>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };

    mockRevokedTokenRepository = {
      findOne: jest.fn(),
    };

    mockConfigService = {
        get: jest.fn().mockReturnValue('testsecret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRevokedGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(RevokedToken),
          useValue: mockRevokedTokenRepository,
        },
        {
            provide: ConfigService,
            useValue: mockConfigService,
        }
      ],
    }).compile();

    guard = module.get<JwtRevokedGuard>(JwtRevokedGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const mockRequest = { headers: {} };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    expect(mockRevokedTokenRepository.findOne).not.toHaveBeenCalled();
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is revoked', async () => {
    const mockRequest = { headers: { authorization: 'Bearer revokedToken' } };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockRevokedTokenRepository.findOne = jest.fn().mockResolvedValue({});

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    expect(mockRevokedTokenRepository.findOne).toHaveBeenCalledWith({ where: { token: 'revokedToken' } });
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const mockRequest = { headers: { authorization: 'Bearer invalidToken' } };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockRevokedTokenRepository.findOne = jest.fn().mockResolvedValue(undefined);
    mockJwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    expect(mockRevokedTokenRepository.findOne).toHaveBeenCalledWith({ where: { token: 'invalidToken' } });
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('invalidToken', { secret: 'testsecret' });
  });

  it('should return true and set user if token is valid and not revoked', async () => {
    const mockRequest = { headers: { authorization: 'Bearer validToken' } };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const mockPayload = { userId: 'testUser' };
    mockRevokedTokenRepository.findOne = jest.fn().mockResolvedValue(undefined);
    mockJwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRevokedTokenRepository.findOne).toHaveBeenCalledWith({ where: { token: 'validToken' } });
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('validToken', { secret: 'testsecret' });
    expect(mockContext.switchToHttp().getRequest()['user']).toBe(mockPayload);
  });
});
