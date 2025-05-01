import { ExecutionContext, UnauthorizedException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport'; // Import the actual AuthGuard type
import { JwtAuthGuard } from './jwt-auth.guard';

// Define a mock function in the test scope for the base AuthGuard's canActivate
const mockBaseGuardCanActivate = jest.fn();

// Mock the AuthGuard factory to return a class that uses the mock function
jest.mock('@nestjs/passport', () => ({
  // Mock AuthGuard to return a class that can be extended
  AuthGuard: jest.fn().mockImplementation((type) => {
    // This function is called when AuthGuard('jwt') is used.
    // It should return a class definition.
    return class MockAuthGuard {
      // The canActivate method will be called on instances of this class.
      // We need to make this a mock function so we can control its behavior and assert on it.
      canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        // Call the mock function defined outside this factory
        return mockBaseGuardCanActivate(context);
      }
    };
  }),
}));


describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let reflector: Reflector;

  // Declare mock request and context objects here
  let mockRequest: any;
  let mockContext: any;

  beforeEach(async () => {
    // Clear the mock function before each test
    mockBaseGuardCanActivate.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard, // Test the real JwtAuthGuard
        Reflector,
      ],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);

    // Create fresh mock objects for request and context for each test
    mockRequest = {
      url: '',
      method: '',
      cookies: {},
      headers: {}, // Ensure headers is an object that can be modified
    };

    mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => mockRequest, // Return the mutable mockRequest object
      }),
    } as ExecutionContext;

    // Spy on reflector.getAllAndOverride after clearing mocks
    jest.spyOn(reflector, 'getAllAndOverride');
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  it('should allow access to public routes', async () => {
    // Arrange
    mockRequest.url = '/public-route';
    mockRequest.method = 'GET';
    mockRequest.cookies = {};
    mockRequest.headers = {}; // Reset headers for this test

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true); // Simulate @Public() decorator

    // Act
    const result = await jwtAuthGuard.canActivate(mockContext);

    // Assert
    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    expect(mockBaseGuardCanActivate).not.toHaveBeenCalled(); // The base guard should not be called for public routes
  });

  it('should call super.canActivate and return its result for protected routes with a token', async () => {
    // Arrange
    mockRequest.url = '/protected-route';
    mockRequest.method = 'GET';
    mockRequest.cookies = { accessToken: 'valid-token' };
    mockRequest.headers = {}; // Reset headers for this test

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false); // Simulate no @Public() decorator
    mockBaseGuardCanActivate.mockResolvedValue(true); // Simulate base guard allowing access (async)

    // Act
    const result = await jwtAuthGuard.canActivate(mockContext);

    // Assert
    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    // Check that the base guard was called with the context containing the modified request
    expect(mockBaseGuardCanActivate).toHaveBeenCalledWith(mockContext);
    // Verify the header was added to the request object within the context by the actual guard logic
    expect(mockRequest.headers['authorization']).toBe('Bearer valid-token');
  });

  it('should call super.canActivate and return its result for protected routes without a token', async () => {
    // Arrange
    mockRequest.url = '/protected-route';
    mockRequest.method = 'GET';
    mockRequest.cookies = {}; // No token in cookies
    mockRequest.headers = {}; // Reset headers for this test

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false); // Simulate no @Public() decorator
    mockBaseGuardCanActivate.mockResolvedValue(false); // Simulate base guard denying access (async)

    // Act
    const result = await jwtAuthGuard.canActivate(mockContext);

    // Assert
    expect(result).toBe(false); // Access should be denied
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    expect(mockBaseGuardCanActivate).toHaveBeenCalledWith(mockContext); // The base guard should be called
    expect(mockRequest.headers['authorization']).toBeUndefined(); // No token should be added to headers
  });

  it('should call super.canActivate and throw UnauthorizedException when base guard denies access (invalid/expired token)', async () => {
    // Arrange
    mockRequest.url = '/protected-route';
    mockRequest.method = 'GET';
    mockRequest.cookies = { accessToken: 'invalid-token' }; // Invalid token
    mockRequest.headers = {}; // Reset headers for this test

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false); // Simulate no @Public() decorator
    mockBaseGuardCanActivate.mockRejectedValue(new UnauthorizedException()); // Simulate base guard throwing UnauthorizedException (async)

    // Act & Assert
    await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException); // Expect UnauthorizedException
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    // Check that the base guard was called with the context containing the modified request
     expect(mockBaseGuardCanActivate).toHaveBeenCalledWith(mockContext);
    // Verify the header was added to the request object within the context
    expect(mockRequest.headers['authorization']).toBe('Bearer invalid-token');
  });

  it('should extract token from authorization header', async () => {
    // Arrange
    mockRequest.url = '/protected-route';
    mockRequest.method = 'GET';
    mockRequest.cookies = {};
    mockRequest.headers = { authorization: 'Bearer header-token' };

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    mockBaseGuardCanActivate.mockResolvedValue(true);

    // Act
    await jwtAuthGuard.canActivate(mockContext);

    // Assert
    expect(mockRequest.headers['authorization']).toBe('Bearer header-token');
    expect(mockBaseGuardCanActivate).toHaveBeenCalledWith(mockContext);
  });

  it('should prioritize authorization header over cookies', async () => {
    // Arrange
    mockRequest.url = '/protected-route';
    mockRequest.method = 'GET';
    mockRequest.cookies = { accessToken: 'cookie-token' };
    mockRequest.headers = { authorization: 'Bearer header-token' };

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    mockBaseGuardCanActivate.mockResolvedValue(true);

    // Act
    await jwtAuthGuard.canActivate(mockContext);

    // Assert
    expect(mockRequest.headers['authorization']).toBe('Bearer header-token');
    expect(mockBaseGuardCanActivate).toHaveBeenCalledWith(mockContext);
  });

  it('should handle expired tokens', async () => {
    // Arrange
    mockRequest.url = '/protected-route';
    mockRequest.method = 'GET';
    mockRequest.cookies = { accessToken: 'expired-token' };
    mockRequest.headers = {};

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    mockBaseGuardCanActivate.mockRejectedValue(new UnauthorizedException('Token expired'));

    // Act & Assert
    await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    expect(mockRequest.headers['authorization']).toBe('Bearer expired-token');
  });
});
