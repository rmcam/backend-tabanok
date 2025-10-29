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
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ["unities"],
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

}
