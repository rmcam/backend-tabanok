// src/features/user/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../auth/entities/user.entity';
import { Account } from '../account/entities/account.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../../auth/enums/auth.enum';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockAccountRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockStatisticsRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockDataSource = () => ({
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    },
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockDataSource = Partial<Record<keyof DataSource, jest.Mock>>;

describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository<User>;
  let accountRepository: MockRepository<Account>;
  let statisticsRepository: MockRepository<Statistics>;
  let dataSource: MockDataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(Account), useFactory: mockAccountRepository },
        { provide: getRepositoryToken(Statistics), useFactory: mockStatisticsRepository },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    accountRepository = module.get(getRepositoryToken(Account));
    statisticsRepository = module.get(getRepositoryToken(Statistics));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('updateRoles', () => {
    it('should update user roles', async () => {
      const userId = 'some-user-id';
      const roles = [UserRole.ADMIN, UserRole.MODERATOR];
      const mockUser = { id: userId, username: 'testuser', roles: [UserRole.USER] };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, roles });

      const result = await userService.updateRoles(userId, roles);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(userRepository.save).toHaveBeenCalledWith({ ...mockUser, roles });
      expect(result.roles).toEqual(roles);
    });
  });
});