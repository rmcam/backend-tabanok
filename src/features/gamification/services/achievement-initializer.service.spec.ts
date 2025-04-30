import { Test, TestingModule } from '@nestjs/testing';
import { AchievementInitializerService } from './achievement-initializer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Achievement } from '../entities/achievement.entity';

describe('AchievementInitializerService', () => {
  let service: AchievementInitializerService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AchievementInitializerService,
        {
          provide: getRepositoryToken(Achievement),
          useValue: {
            // Mock methods used by AchievementInitializerService
            count: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(), // Añadir mock para findOne
          },
        },
      ],
    }).compile();

    service = module.get<AchievementInitializerService>(AchievementInitializerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('onModuleInit should call initializeAchievements', async () => {
    // Espiar el método initializeAchievements
    const initializeAchievementsSpy = jest.spyOn(service as any, 'initializeAchievements');

    // Llamar a onModuleInit
    await service.onModuleInit();

    // Verificar que initializeAchievements fue llamado
    expect(initializeAchievementsSpy).toHaveBeenCalled();
  });

  it('initializeAchievements should check for existing achievements and save new ones', async () => {
    const mockAchievements = [
      { name: 'Test Achievement 1', description: 'Desc 1', criteria: 'CRITERIA', requirement: 1, bonusPoints: 10, badge: { id: 'badge-1', name: 'Badge 1', icon: '', description: '' } },
      { name: 'Test Achievement 2', description: 'Desc 2', criteria: 'CRITERIA', requirement: 2, bonusPoints: 20, badge: { id: 'badge-2', name: 'Badge 2', icon: '', description: '' } },
    ];

    // Mockear findOne para simular que el primer logro ya existe y el segundo no
    const findOneMock = (module as unknown as TestingModule).get(getRepositoryToken(Achievement)).findOne as jest.Mock;
    // Mockear findOne para simular que el primer logro ya existe y los otros 12 no
    findOneMock.mockImplementation((query) => {
      // Simula que el primer logro buscado existe, y los demás no.
      if (findOneMock.mock.calls.length === 1) {
         // Devuelve un objeto simulado para la primera llamada
         return Promise.resolve({ name: 'Simulated Existing Achievement' }); // Objeto simulado
      } else {
         // Devuelve undefined para las llamadas subsiguientes
         return Promise.resolve(undefined);
      }
    });

    // Mockear save
    const saveMock = (module as unknown as TestingModule).get(getRepositoryToken(Achievement)).save as jest.Mock;

    // Llamar al método privado initializeAchievements
    await (service as any).initializeAchievements();

    // Verificar que findOne fue llamado 13 veces (una por cada logro predeterminado)
    expect(findOneMock).toHaveBeenCalledTimes(13);

    // Verificar que save fue llamado 12 veces (una por cada logro que no existía)
    expect(saveMock).toHaveBeenCalledTimes(12);
  });
});
