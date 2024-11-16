import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiTags('users')
  @Get('/users')
  getUsers() {
    return this.usersService.getUsers();
  }

  @ApiTags('users')
  @Post('/users')
  createUser(@Body() user: CreateUserDto) {
    return this.usersService.createUser(user);
  }
}
