import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post()
    @ApiOperation({ summary: 'Crear cuenta' })
    @ApiBody({ type: CreateAccountDto })
    @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud inválida' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    create(@Body() createAccountDto: CreateAccountDto) {
        return this.accountService.create(createAccountDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las cuentas' })
    @ApiResponse({ status: 200, description: 'Lista de cuentas obtenida exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findAll() {
        return this.accountService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener cuenta por ID' })
    @ApiParam({ name: 'id', description: 'ID de la cuenta a obtener' })
    @ApiResponse({ status: 200, description: 'Cuenta obtenida exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
    findOne(@Param('id') id: string) {
        return this.accountService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar cuenta' })
    @ApiParam({ name: 'id', description: 'ID de la cuenta a actualizar' })
    @ApiBody({ type: UpdateAccountDto })
    @ApiResponse({ status: 200, description: 'Cuenta actualizada exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud inválida' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
    update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
        return this.accountService.update(id, updateAccountDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar cuenta' })
    @ApiParam({ name: 'id', description: 'ID de la cuenta a eliminar' })
    @ApiResponse({ status: 204, description: 'Cuenta eliminada exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
    remove(@Param('id') id: string) {
        return this.accountService.remove(id);
    }

    @Patch(':id/settings')
    @ApiOperation({ summary: 'Actualizar configuración de la cuenta' })
    @ApiParam({ name: 'id', description: 'ID de la cuenta a actualizar' })
    @ApiBody({ description: 'Configuración a actualizar' })
    @ApiResponse({ status: 200, description: 'Configuración actualizada exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud inválida' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
    updateSettings(@Param('id') id: string, @Body() settings: Record<string, any>) {
        return this.accountService.updateSettings(id, settings);
    }

    @Patch(':id/preferences')
    @ApiOperation({ summary: 'Actualizar preferencias de la cuenta' })
    @ApiParam({ name: 'id', description: 'ID de la cuenta a actualizar' })
    @ApiBody({ description: 'Preferencias a actualizar' })
    @ApiResponse({ status: 200, description: 'Preferencias actualizadas exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud inválida' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
    updatePreferences(@Param('id') id: string, @Body() preferences: Record<string, any>) {
        return this.accountService.updatePreferences(id, preferences);
    }

    @Patch(':id/streak')
    @ApiOperation({ summary: 'Actualizar racha de la cuenta' })
    @ApiParam({ name: 'id', description: 'ID de la cuenta a actualizar' })
    @ApiBody({ description: 'Nueva racha' })
    @ApiResponse({ status: 200, description: 'Racha actualizada exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud inválida' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
    updateStreak(@Param('id') id: string, @Body('streak') streak: number) {
        return this.accountService.updateStreak(id, streak);
    }
}
