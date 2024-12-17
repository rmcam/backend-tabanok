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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':email')
  findOne(@Body() @Param('email') email: string) {
    return this.accountsService.findOne(email);
  }

  @Patch(':email')
  update(
    @Param('email') email: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    

    return this.accountsService.updateEmailVerified(email);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(+id);
  }
}
