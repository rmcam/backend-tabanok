import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm"; // Import DataSource
import { User } from "../../auth/entities/user.entity";
import { UserRole, UserStatus } from "../../auth/enums/auth.enum";
import { Account } from "../account/entities/account.entity";
import { Statistics } from "../statistics/entities/statistics.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Statistics)
    private readonly statisticsRepository: Repository<Statistics>,
    private dataSource: DataSource // Inject DataSource
  ) {}

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }
    return user;
  }

  async findByUsernameOptional(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, { // Use queryRunner.manager.create
        ...createUserDto,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        gameStats: {
          totalPoints: 0,
          level: 1,
          streak: 0,
          lastActivity: new Date(),
        },
        points: 0,
        level: 1,
        languages: createUserDto.languages || [],
        preferences: {
          notifications: true,
          language: "es",
          theme: "light",
        },
        isEmailVerified: false,
        culturalPoints: 0,
      });

      const savedUser = await queryRunner.manager.save(user); // Use queryRunner.manager.save

      if (process.env.NODE_ENV !== "test") {
        const account = queryRunner.manager.create(Account, { // Use queryRunner.manager.create
          points: 0,
          level: 1,
          isActive: true,
          user: savedUser, // Associate with the saved user
        });
        await queryRunner.manager.save(account); // Use queryRunner.manager.save
      }

      await queryRunner.commitTransaction();
      return savedUser;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    return user;
  }

  async findByEmailOptional(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id } }); // Use queryRunner.manager
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      // Eliminar estadísticas asociadas al usuario
      await queryRunner.manager.delete(Statistics, { userId: id }); // Use queryRunner.manager.delete
      await queryRunner.manager.remove(user); // Use queryRunner.manager.remove

      await queryRunner.commitTransaction();

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Métodos para restablecimiento de contraseña ---

  async setResetToken(
    userId: string,
    token: string | null,
    expires: Date | null
  ): Promise<void> {
    await this.userRepository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    // Busca usuarios con el token que no haya expirado
    return this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        // resetPasswordExpires: MoreThan(new Date()), // TypeORM > 0.3 requires MoreThanOrEqual? Check docs if needed. For now, check expiry in AuthService
      },
    });
  }

  async updatePasswordAndClearResetToken(
    userId: string,
    hashedPassword: string
  ): Promise<void> {
    await this.userRepository.update(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  // --- Métodos existentes ---

  async updatePoints(userId: string, points: number): Promise<User> {
    const user = await this.findOne(userId);
    const gameStats = {
      ...user.gameStats,
      totalPoints: points,
    };

    return await this.userRepository.save({
      ...user,
      points,
      gameStats,
    });
  }

  async updateLevel(userId: string, level: number): Promise<User> {
    const user = await this.findOne(userId);
    const gameStats = {
      ...user.gameStats,
      level,
    };

    return await this.userRepository.save({
      ...user,
      level,
      gameStats,
    });
  }
}
