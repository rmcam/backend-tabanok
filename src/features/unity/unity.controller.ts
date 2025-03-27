import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnityService } from './unity.service';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UpdateUnityDto } from './dto/update-unity.dto';
import { Unity } from './entities/unity.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('unity')
@ApiBearerAuth()
@Controller('unity')
export class UnityController {
  constructor(private readonly unityService: UnityService) {}

  @Get()
  async findAll(): Promise<Unity[]> {
    return this.unityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Unity> {
    return this.unityService.findOne(id);
  }

  @Post()
  async create(@Body() unity: Unity): Promise<Unity> {
    return this.unityService.create(unity);
  }
}
