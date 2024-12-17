import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { CreateVerifyTokenDto } from './dto/create-verify-token.dto';
import { UpdateVerifyTokenDto } from './dto/update-verify-token.dto';
import { VerifyToken } from './entities/verifyToken.entity';

@Injectable()
export class VerifyTokenService {
  constructor(
    @InjectRepository(VerifyToken)
    private readonly verifyTokenRepository: Repository<VerifyToken>,
  ) {}

  async create(createVerifyTokenDto: CreateVerifyTokenDto) {
    const existingToken = await this.verifyTokenRepository.findOne({
      where: { identifier: createVerifyTokenDto.identifier },
    });

    if (existingToken) {
      throw new ConflictException('Ya existe un token para este usuario.');
    }

    return await this.verifyTokenRepository.save(createVerifyTokenDto);
  }

  async findOne(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const tokenEntity = await this.verifyTokenRepository.findOne({
        where: { token },
      });
      if (!tokenEntity) {
        throw new NotFoundException('Token no encontrado.');
      }

      return tokenEntity;
    } catch (error) {
      throw new NotFoundException('Token inválido o expirado.');
    }
  }

  async findAll() {
    return await this.verifyTokenRepository.find();
  }

  async update(email: string, updateVerifyTokenDto: UpdateVerifyTokenDto) {
    const result = await this.verifyTokenRepository.update(
      { identifier: email },
      { ...updateVerifyTokenDto },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return await this.verifyTokenRepository.findOne({
      where: { identifier: email },
    });
  }

  async remove(email: string) {
    const user = await this.verifyTokenRepository.findOne({
      where: { identifier: email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return await this.verifyTokenRepository.delete({ identifier: email });
  }
}
