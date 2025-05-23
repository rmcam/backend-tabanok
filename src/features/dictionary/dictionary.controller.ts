import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KamentsaValidatorService } from '../language-validation/kamentsa-validator.service';
import { DictionaryEntryDto } from './dto/dictionary-entry.dto'; // Importar el nuevo DTO

@ApiTags('dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(@Inject(KamentsaValidatorService) private readonly kamentsaValidatorService: KamentsaValidatorService) { }

  @Get('search')
  @ApiOperation({ summary: 'Buscar en el diccionario Kamëntsá' })
  @ApiQuery({ name: 'q', description: 'Término de búsqueda', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Resultado de la búsqueda', type: DictionaryEntryDto })
  @ApiResponse({ status: 400, description: 'Término de búsqueda inválido' })
  async search(@Query('q') query: string) {
    const normalizedWord = this.kamentsaValidatorService.normalizeText(query);
    let entry = (this.kamentsaValidatorService as any).dictionary.find(
      (dictEntry: any) => {
        if (typeof dictEntry === 'object' && dictEntry !== null) {
          const textToNormalize = dictEntry.entrada;
          const normalizedText = this.kamentsaValidatorService.normalizeText(textToNormalize);
          return normalizedText.includes(normalizedWord) || (dictEntry.significados && dictEntry.significados.some((significado: any) => this.kamentsaValidatorService.normalizeText(significado.definicion).includes(normalizedWord)));
        }
        return false;
      }
    );

    if (!entry) {
      const spanishEntry = (this.kamentsaValidatorService as any).dictionary.find(
        (dictEntry: any) => {
          if (typeof dictEntry === 'object' && dictEntry !== null && dictEntry.equivalentes) {
            const textToNormalize = dictEntry.entrada;
            const normalizedText = this.kamentsaValidatorService.normalizeText(textToNormalize);
            return normalizedText.includes(normalizedWord);
          }
          return false;
        }
      );
      if (spanishEntry) {
        entry = (this.kamentsaValidatorService as any).dictionary.find(
          (dictEntry: any) => {
            if (typeof dictEntry === 'object' && dictEntry !== null && dictEntry.entrada === spanishEntry.equivalentes[0].palabra) {
              return true;
            }
            return false;
          }
        );
      }
    }

    // Retornar una instancia del DTO para que Swagger pueda inferir el esquema
    return entry ? (entry as DictionaryEntryDto) : null;
  }
}
