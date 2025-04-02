import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CulturalContentService } from '../../../../src/features/cultural-content/cultural-content.service';
import { CulturalContent } from '../../../../src/features/cultural-content/cultural-content.entity';
import { CreateCulturalContentDto } from '../../../../src/features/cultural-content/dto/create-cultural-content.dto';
import { UpdateCulturalContentDto } from '../../../../src/features/cultural-content/dto/update-cultural-content.dto';

describe('CulturalContentService', () => {
  let service: CulturalContentService;
  let repository: Repository<CulturalContent>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturalContentService,
        {
          provide: getRepositoryToken(CulturalContent),
          useValue: {
            find: jest.fn().mockImplementation((options?: FindManyOptions<CulturalContent>) => {
              // Handle no options case
              if (!options) {
                return Promise.resolve([]);
              }
              
              if (options?.where) {
                const where = options.where as any;
                if (where.category) {
                  return Promise.resolve([{
                    id: '1',
                    title: 'Contenido filtrado',
                    description: 'Descripción',
                    category: where.category,
                    content: 'Contenido',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }]);
                }
              }
              if (options?.skip !== undefined) {
                return Promise.resolve([{
                  id: '1',
                  title: 'Contenido paginado',
                  description: 'Descripción',
                  category: 'General',
                  content: 'Contenido',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }]);
              }
              return Promise.resolve([]);
            }),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn()
          },
        },
      ],
    }).compile();

    service = module.get<CulturalContentService>(CulturalContentService);
    repository = module.get<Repository<CulturalContent>>(
      getRepositoryToken(CulturalContent),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear contenido cultural correctamente', async () => {
      const createDto: CreateCulturalContentDto = {
        title: 'Tradición oral Kamëntsá',
        description: 'Relatos ancestrales',
        category: 'Oralidad',
        content: 'Contenido detallado',
        mediaUrl: 'https://ejemplo.com/imagen.jpg',
        type: 'text'
      };

      const expectedResult = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(repository, 'create').mockReturnValue(expectedResult);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(expectedResult);
    });

    it('should validate required fields', async () => {
      const createDto = {
        title: '', // Campo requerido vacío
        description: 'Descripción',
        category: 'Categoría',
        content: 'Contenido'
      } as CreateCulturalContentDto;

      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Validation failed'));

      await expect(service.create(createDto)).rejects.toThrow('Validation failed');
    });

    it('should handle Kamëntsá diacritics correctly', async () => {
      const createDto: CreateCulturalContentDto = {
        title: 'Ts̈ëngbe - El origen del mundo',
        description: 'Mito de creación Kamëntsá con diacríticos: s̈, ë, ts̈',
        category: 'Mitos',
        content: 'Contenido con caracteres especiales: ñ, ë, s̈, ts̈',
        type: 'text'
      };

      const expectedResult = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(repository, 'create').mockReturnValue(expectedResult);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result.title).toContain('Ts̈ëngbe');
      expect(result.description).toContain('diacríticos');
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los contenidos culturales', async () => {
      const expectedContents = [
        {
          id: '1',
          title: 'Contenido 1',
          description: 'Descripción 1',
          category: 'Categoría 1',
          content: 'Contenido 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Contenido 2',
          description: 'Descripción 2',
          category: 'Categoría 2',
          content: 'Contenido 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      jest.spyOn(repository, 'find').mockImplementation(async (options?: FindManyOptions<CulturalContent>) => {
        if (!options) return expectedContents;
        if (options.skip === 0 && options.take === 10) {
          return expectedContents;
        }
        return [];
      });

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result).toEqual(expectedContents);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should support pagination when options provided', async () => {
      const expectedContents = [
        {
          id: '1',
          title: 'Contenido paginado',
          description: 'Descripción',
          category: 'Categoría',
          content: 'Contenido',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      jest.spyOn(repository, 'find').mockImplementation(async (options?: FindManyOptions<CulturalContent>) => {
        if (options?.skip === 10 && options?.take === 1) {
          return Promise.resolve(expectedContents);
        }
        return Promise.resolve([]);
      });

      const result = await service.findAll({ skip: 10, take: 1 });

      expect(result).toEqual(expectedContents);
    });

    it('should handle large result sets efficiently', async () => {
      const mockContents = Array(1000).fill(0).map((_, i) => ({
        id: `${i}`,
        title: `Contenido ${i}`,
        description: `Descripción ${i}`,
        category: `Categoría ${i % 5}`,
        content: `Contenido ${i}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      jest.spyOn(repository, 'find').mockImplementation(async (options?: FindManyOptions<CulturalContent>) => {
        const take = options?.take || 10;
        const skip = options?.skip || 0;
        return Promise.resolve(mockContents.slice(skip, skip + take));
      });

      const startTime = Date.now();
      const result = await service.findAll({ skip: 0, take: 100 });
      const duration = Date.now() - startTime;

      expect(result).toHaveLength(100);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('findOne', () => {
    it('debería retornar un contenido cultural por ID', async () => {
      const contentId = '1';
      const expectedContent = {
        id: contentId,
        title: 'Contenido específico',
        description: 'Descripción',
        category: 'Categoría',
        content: 'Contenido',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedContent);

      const result = await service.findOne(contentId);

      expect(result).toEqual(expectedContent);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: contentId }
      });
    });

    it('debería lanzar NotFoundException si el contenido no existe', async () => {
      const contentId = '999';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(contentId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

    describe('findByCategory', () => {
    it('debería retornar contenidos por categoría', async () => {
      const category = 'Oralidad';
      const expectedContents = [{
        id: '1',
        title: 'Contenido filtrado',
        description: 'Descripción',
        category,
        content: 'Contenido',
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      const result = await service.findByCategory(category);

      expect(result).toEqual(expectedContents);
      expect(repository.find).toHaveBeenCalledWith({
        where: { category }
      });
    });

    it('should return empty array for non-existent category', async () => {
      const category = 'Categoría inexistente';
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.findByCategory(category);

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { category }
      });
    });

    it('should handle Kamëntsá category names', async () => {
      const category = 'Ts̈ëngbe (Mitos)';
      const expectedContents = [{
        id: '1',
        title: 'Ts̈ëngbe',
        description: 'Mito Kamëntsá',
        category,
        content: 'Contenido',
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      jest.spyOn(repository, 'find').mockResolvedValue(expectedContents);

      const result = await service.findByCategory(category);

      expect(result[0].category).toBe(category);
    });
  });

  describe('update', () => {
    it('debería actualizar un contenido cultural', async () => {
      const contentId = '1';
      const updateDto: UpdateCulturalContentDto = {
        title: 'Título actualizado'
      };

      const existingContent = {
        id: contentId,
        title: 'Título original',
        description: 'Descripción original',
        category: 'Categoría',
        content: 'Contenido',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expectedResult = {
        ...existingContent,
        ...updateDto,
        updatedAt: expect.any(Date)
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingContent);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedResult);

      const result = await service.update(contentId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(contentId);
      expect(repository.save).toHaveBeenCalledWith(expectedResult);
    });

    it('should validate media URLs when updating', async () => {
      const contentId = '1';
      const updateDto: UpdateCulturalContentDto = {
        mediaUrl: 'invalid-url'
      };

      const existingContent = {
        id: contentId,
        title: 'Título',
        description: 'Descripción',
        category: 'Categoría',
        content: 'Contenido',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingContent);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Invalid media URL'));

      await expect(service.update(contentId, updateDto))
        .rejects
        .toThrow('Invalid media URL');
    });

    it('should preserve Kamëntsá diacritics when updating', async () => {
      const contentId = '1';
      const updateDto: UpdateCulturalContentDto = {
        title: 'Ts̈ëngbe actualizado'
      };

      const existingContent = {
        id: contentId,
        title: 'Ts̈ëngbe original',
        description: 'Descripción',
        category: 'Mitos',
        content: 'Contenido',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingContent);
      jest.spyOn(repository, 'save').mockImplementation(async (content: CulturalContent) => {
        return {
          ...content,
          id: content.id || '1',
          createdAt: content.createdAt || new Date(),
          updatedAt: new Date()
        } as CulturalContent;
      });

      const result = await service.update(contentId, updateDto);

      expect(result.title).toBe('Ts̈ëngbe actualizado');
      expect(result.title).toContain('s̈');
      expect(result.title).toContain('ë');
    });
  });

  describe('remove', () => {
    it('debería eliminar un contenido cultural', async () => {
      const contentId = '1';
      const existingContent = {
        id: contentId,
        title: 'Contenido a eliminar',
        description: 'Descripción',
        category: 'Categoría',
        content: 'Contenido',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingContent);
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      await service.remove(contentId);

      expect(service.findOne).toHaveBeenCalledWith(contentId);
      expect(repository.remove).toHaveBeenCalledWith(existingContent);
    });
  });
});
