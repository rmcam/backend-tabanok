import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post()
    create(@Body() createAccountDto: CreateAccountDto) {
        return this.accountService.create(createAccountDto);
    }

    @Get()
    findAll() {
        return this.accountService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.accountService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
        return this.accountService.update(id, updateAccountDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.accountService.remove(id);
    }

    @Patch(':id/settings')
    updateSettings(@Param('id') id: string, @Body() settings: Record<string, any>) {
        return this.accountService.updateSettings(id, settings);
    }

    @Patch(':id/preferences')
    updatePreferences(@Param('id') id: string, @Body() preferences: Record<string, any>) {
        return this.accountService.updatePreferences(id, preferences);
    }

    @Patch(':id/streak')
    updateStreak(@Param('id') id: string, @Body('streak') streak: number) {
        return this.accountService.updateStreak(id, streak);
    }
} 