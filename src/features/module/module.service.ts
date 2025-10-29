import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
import { Module } from "./entities/module.entity";
import { PaginationDto } from '../../common/dto/pagination.dto'; // Importar PaginationDto
import { Unity } from '../unity/entities/unity.entity'; // Importar la entidad Unity

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    const module = this.moduleRepository.create(createModuleDto);
    return this.moduleRepository.save(module);
  }

  async findAll(paginationDto: PaginationDto): Promise<Module[]> {
    const { limit, page } = paginationDto;
    return this.moduleRepository.find({
      relations: ["unities", "unities.lessons", "unities.lessons.topics"],
      select: {
        id: true,
        name: true,
        description: true,
        unities: {
          id: true,
          title: true,
          description: true,
          order: true,
          isLocked: true,
          requiredPoints: true,
          isActive: true,
          lessons: {
            id: true,
            title: true,
            description: true,
            order: true,
            isLocked: true,
            isCompleted: true,
            isFeatured: true,
            requiredPoints: true,
            isActive: true,
            topics: {
              id: true,
              title: true,
              description: true,
              order: true,
              isLocked: true,
              requiredPoints: true,
              isActive: true,
            }
          }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ["unities", "unities.lessons", "unities.lessons.topics"],
      select: {
        id: true,
        name: true,
        description: true,
        unities: {
          id: true,
          title: true,
          description: true,
          order: true,
          isLocked: true,
          requiredPoints: true,
          isActive: true,
          lessons: {
            id: true,
            title: true,
            description: true,
            order: true,
            isLocked: true,
            isCompleted: true,
            isFeatured: true,
            requiredPoints: true,
            isActive: true,
            topics: {
              id: true,
              title: true,
              description: true,
              order: true,
              isLocked: true,
              requiredPoints: true,
              isActive: true,
            }
          }
        }
      }
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const result = await this.moduleRepository.update(id, updateModuleDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.moduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
  }

  async findUnitiesByModuleId(moduleId: string, paginationDto: PaginationDto): Promise<Unity[]> {
    const { limit, page } = paginationDto;
    const unities = await this.moduleRepository
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.unities', 'unity')
      .where('module.id = :moduleId', { moduleId })
      .take(limit)
      .skip((page - 1) * limit)
      .getMany(); // Obtener los módulos que contienen las unidades paginadas

    // Extraer las unidades de los módulos encontrados
    const allUnities = unities.flatMap(module => module.unities);
    return allUnities;
  }

  async findAllWithUnities(): Promise<Module[]> {
    return this.moduleRepository.find({
      relations: ["unities", "unities.lessons", "unities.lessons.topics"],
      select: {
        id: true,
        name: true,
        description: true,
        unities: {
          id: true,
          title: true,
          description: true,
          order: true,
          isLocked: true,
          requiredPoints: true,
          isActive: true,
          lessons: {
            id: true,
            title: true,
            description: true,
            order: true,
            isLocked: true,
            isCompleted: true,
            isFeatured: true,
            requiredPoints: true,
            isActive: true,
            topics: {
              id: true,
              title: true,
              description: true,
              order: true,
              isLocked: true,
              requiredPoints: true,
              isActive: true,
            }
          }
        }
      }
    });
  }

  async findOneWithUnities(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ["unities", "unities.lessons", "unities.lessons.topics"],
      select: {
        id: true,
        name: true,
        description: true,
        unities: {
          id: true,
          title: true,
          description: true,
          order: true,
          isLocked: true,
          requiredPoints: true,
          isActive: true,
          lessons: {
            id: true,
            title: true,
            description: true,
            order: true,
            isLocked: true,
            isCompleted: true,
            isFeatured: true,
            requiredPoints: true,
            isActive: true,
            topics: {
              id: true,
              title: true,
              description: true,
              order: true,
              isLocked: true,
              requiredPoints: true,
              isActive: true,
            }
          }
        }
      }
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }
}
