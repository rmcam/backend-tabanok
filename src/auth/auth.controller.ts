import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Res
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Role } from '../common/enums/role.enum';
import { UserActiveInterface } from '../common/interfaces/user-active.interface';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signin')
  async signin(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { user, accessToken, refreshToken } =
        await this.authService.signin(loginDto);
      res.status(HttpStatus.OK).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
    }
  }
  @Post('signup')
  async signup(@Body() registerDto: RegisterDto) {
    return this.authService.signup(registerDto);
  }

  @Get('profile')
  @Auth(Role.USER)
  profile(@ActiveUser() user: UserActiveInterface) {
    return this.authService.profile(user);
  }
}
