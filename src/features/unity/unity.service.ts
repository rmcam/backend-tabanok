import { Injectable } from '@nestjs/common';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UpdateUnityDto } from './dto/update-unity.dto';
import { Unity } from './entities/unity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UnityService {
  constructor(
    @InjectRepository(Unity)
    private unityRepository: Repository<Unity>,
  ) {}
  async findAll(): Promise<Unity[]> {
    return this.unityRepository.find({ relations: ['lessons'] });
  }

  async findOne(id: number): Promise<Unity> {
    return this.unityRepository.findOne({ where: { id }, relations: ['lessons'] });
  }

  async create(unity: Unity): Promise<Unity> {
    return this.unityRepository.save(unity);
  }
}
