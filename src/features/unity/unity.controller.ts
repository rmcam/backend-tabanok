import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UnityService } from './unity.service';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('unities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnityController {
  constructor(private readonly unityService: UnityService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createUnityDto: CreateUnityDto) {
    return this.unityService.create(createUnityDto);
  }

  @Get()
  findAll() {
    return this.unityService.findAll();
  }

  @Get('order/:order')
  findByOrder(@Param('order') order: number) {
    return this.unityService.findByOrder(order);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unityService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() updateUnityDto: Partial<CreateUnityDto>,
  ) {
    return this.unityService.update(id, updateUnityDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.unityService.remove(id);
  }
}
