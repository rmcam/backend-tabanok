import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnityDto } from './dto/create-unity.dto';
import { Unity } from './entities/unity.entity';

@Injectable()
export class UnityService {
  constructor(
    @InjectRepository(Unity)
    private unityRepository: Repository<Unity>,
  ) {}

  async create(createUnityDto: CreateUnityDto): Promise<Unity> {
    const unity = this.unityRepository.create(createUnityDto);
    return this.unityRepository.save(unity);
  }

  async findAll(): Promise<Unity[]> {
    return this.unityRepository.find();
  }

  async findOne(id: string): Promise<Unity> {
    const unity = await this.unityRepository.findOne({
      where: { id },
    });

    if (!unity) {
      throw new NotFoundException('Unity not found');
    }

    return unity;
  }

  async update(id: string, updateUnityDto: Partial<CreateUnityDto>): Promise<Unity> {
    const unity = await this.findOne(id);
    Object.assign(unity, updateUnityDto);
    return this.unityRepository.save(unity);
  }

  async remove(id: string): Promise<void> {
    const unity = await this.findOne(id);
    await this.unityRepository.remove(unity);
  }

  async findByOrder(order: number): Promise<Unity[]> {
    return this.unityRepository.find({
      where: { order },
    });
  }
}
