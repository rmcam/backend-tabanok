import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
import { Module } from "./entities/module.entity";

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

  async findAll(): Promise<Module[]> {
    return this.moduleRepository.find();
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { id } });
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

  async findUnitiesByModuleId(moduleId: string): Promise<Module | null> {
    return this.moduleRepository.findOne({
      where: { id: moduleId },
      relations: ["unities"], // Load the related unities
    });
  }

  async findAllWithUnities(): Promise<Module[]> {
    return this.moduleRepository.find({
      relations: ["unities", "unities.lessons", "unities.lessons.exercises", "unities.lessons.multimedia"],
    });
  }

  async findOneWithUnities(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ["unities", "unities.lessons", "unities.lessons.exercises", "unities.lessons.multimedia"],
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }
}
