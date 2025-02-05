import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
      where: { email: createVerifyTokenDto.email },
    });

    if (existingToken) {
      console.log(
        `http://localhost:3000/api/auth/verify-email?token=${existingToken.token}',`,
      );

      throw new UnauthorizedException(
        'Your email is not verified. A verification email has been sent',
      );
    }

    return await this.verifyTokenRepository.save(createVerifyTokenDto);
  }

  async findOne(token: string) {
    try {
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
      { email: email },
      { ...updateVerifyTokenDto },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return await this.verifyTokenRepository.findOne({
      where: { email: email },
    });
  }

  async remove(email: string) {
    const user = await this.verifyTokenRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return await this.verifyTokenRepository.delete({ email: email });
  }
}
