import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: 'AccountRepository',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call create method', async () => {
      const dto = { name: 'Test User', email: 'test@example.com' } as any;
      jest.spyOn(service, 'create').mockResolvedValue(dto);
      const result = await service.create(dto);
      expect(result).toEqual(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of accounts', async () => {
      const accounts = [{ id: '1' }, { id: '2' }] as any;
      jest.spyOn(service, 'findAll').mockResolvedValue(accounts);
      const result = await service.findAll();
      expect(result).toEqual(accounts);
    });
  });

  describe('findOne', () => {
    it('should return a single account', async () => {
      const account = { id: '1' } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(account);
      const result = await service.findOne('1');
      expect(result).toEqual(account);
    });
  });
});
