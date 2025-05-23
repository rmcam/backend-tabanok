import { Controller, Post, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KamentsaValidatorService, ValidationResult } from './kamentsa-validator.service';
import { ValidateTextDto } from './dto/validate-text.dto'; // Importar el DTO de entrada
import { ValidationResultDto } from './dto/validation-result.dto'; // Importar el DTO de salida

@ApiTags('language-validation')
@Controller('language-validation')
export class LanguageValidationController {
  constructor(
    @Inject(KamentsaValidatorService)
    private readonly kamentsaValidatorService: KamentsaValidatorService,
  ) {}

  @Post('validate')
  @ApiOperation({ summary: 'Valida un texto en Kamëntsá' })
  @ApiBody({ type: ValidateTextDto, description: 'Texto a validar' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resultado de la validación', type: ValidationResultDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Solicitud inválida' })
  @HttpCode(HttpStatus.OK)
  async validateText(@Body() validateTextDto: ValidateTextDto): Promise<ValidationResult> {
    return this.kamentsaValidatorService.validateText(validateTextDto.text);
  }
}
