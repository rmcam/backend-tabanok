import { Controller, Post, Body, Inject, HttpCode } from '@nestjs/common';
import { KamentsaValidatorService, ValidationResult } from './kamentsa-validator.service';

@Controller('language-validation')
export class LanguageValidationController {
  constructor(
    @Inject(KamentsaValidatorService)
    private readonly kamentsaValidatorService: KamentsaValidatorService,
  ) {}

  @Post('validate')
  @HttpCode(200)
  async validateText(@Body('text') text: string): Promise<ValidationResult> {
    return this.kamentsaValidatorService.validateText(text);
  }
}
