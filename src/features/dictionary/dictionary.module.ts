import { Module } from '@nestjs/common';
import { DictionaryController } from './dictionary.controller';
import { KamentsaValidatorService } from '../language-validation/kamentsa-validator.service';

@Module({
  controllers: [DictionaryController],
  providers: [KamentsaValidatorService],
})
export class DictionaryModule { }
