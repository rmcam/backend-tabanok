import { Controller, Post, Body, Inject, HttpCode } from '@nestjs/common';
import { KamentsaValidatorService } from './kamentsa-validator.service';
import { ValidationResult } from './interfaces/kamentsa-validator.interface';

@Controller('language-validation')
export class LanguageValidationController {
  constructor(
    @Inject(KamentsaValidatorService)
    private readonly kamentsaValidatorService: KamentsaValidatorService,
  ) {}

  @Post('validate')
  @HttpCode(200)
  async validateText(@Body('text') text: string): Promise<ValidationResult> {
    if (!text) {
      throw new Error('El texto a validar no puede ser nulo o vacío');
    }
    return this.kamentsaValidatorService.validateText(text);
  }
}
