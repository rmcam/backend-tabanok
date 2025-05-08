import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updateSettings: jest.fn(),
            updatePreferences: jest.fn(),
            updateStreak: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of accounts', async () => {
      const result = ['test']; // Mock the expected result
      jest.spyOn(service, 'findAll').mockImplementation(async () => result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single account', async () => {
      const accountId = 'some-id';
      const result = { id: accountId, name: 'Test Account' }; // Mock the expected result
      jest.spyOn(service, 'findOne').mockImplementation(async () => result as any);

      expect(await controller.findOne(accountId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createAccountDto = { name: 'New Account' }; // Mock the DTO
      const result = { id: 'new-id', ...createAccountDto }; // Mock the expected result
      jest.spyOn(service, 'create').mockImplementation(async () => result as any);

      expect(await controller.create(createAccountDto as any)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update an existing account', async () => {
      const accountId = 'some-id';
      const updateAccountDto = { name: 'Updated Account' }; // Mock the DTO
      const result = { id: accountId, ...updateAccountDto }; // Mock the expected result
      jest.spyOn(service, 'update').mockImplementation(async () => result as any);

      expect(await controller.update(accountId, updateAccountDto as any)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove an account', async () => {
      const accountId = 'some-id';
      jest.spyOn(service, 'remove').mockImplementation(async () => undefined as any); // Mock the expected result

      expect(await controller.remove(accountId)).toBeUndefined();
    });
  });

  describe('updateSettings', () => {
    it('should update account settings', async () => {
      const accountId = 'some-id';
      const settings = { theme: 'dark' }; // Mock the settings
      const result = { id: accountId, settings }; // Mock the expected result
      jest.spyOn(service, 'updateSettings').mockImplementation(async () => result as any);

      expect(await controller.updateSettings(accountId, settings)).toBe(result);
    });
  });

  describe('updatePreferences', () => {
    it('should update account preferences', async () => {
      const accountId = 'some-id';
      const preferences = { language: 'es' }; // Mock the preferences
      const result = { id: accountId, preferences }; // Mock the expected result
      jest.spyOn(service, 'updatePreferences').mockImplementation(async () => result as any);

      expect(await controller.updatePreferences(accountId, preferences)).toBe(result);
    });
  });

  describe('updateStreak', () => {
    it('should update account streak', async () => {
      const accountId = 'some-id';
      const streak = 5; // Mock the streak value
      const result = { id: accountId, streak }; // Mock the expected result
      jest.spyOn(service, 'updateStreak').mockImplementation(async () => result as any);

      expect(await controller.updateStreak(accountId, streak)).toBe(result);
    });
  });
});
