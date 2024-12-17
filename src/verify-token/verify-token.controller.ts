import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateVerifyTokenDto } from './dto/create-verify-token.dto';
import { UpdateVerifyTokenDto } from './dto/update-verify-token.dto';
import { VerifyTokenService } from './verify-token.service';
@ApiTags('verify-token')
@Controller('verify-token')
export class VerifyTokenController {
  constructor(private readonly verifyTokenService: VerifyTokenService) {}
  @Post()
  async create(@Body() createVerifyTokenDto: CreateVerifyTokenDto) {
    try {
      const result = await this.verifyTokenService.create(createVerifyTokenDto);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('all')
  async findAll() {
    return this.verifyTokenService.findAll();
  }
  @Get(':token')
  async findOne(@Param('token') token: string) {
    try {
      const verifyToken = await this.verifyTokenService.findOne(token);
      if (!verifyToken) {
        return { success: false, error: 'Token no encontrado' };
      }
      return { success: true, data: verifyToken };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  @Patch(':email')
  update(
    @Param('email') email: string,
    @Body() updateVerifyTokenDto: UpdateVerifyTokenDto,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.verifyTokenService.update(email, updateVerifyTokenDto);
  }

  @Delete(':email')
  async remove(@Param('email') email: string) {
    return await this.verifyTokenService.remove(email);
  }
}
