import { ApiProperty } from '@nestjs/swagger';
import { Vocabulary } from '../entities/vocabulary.entity';

export class PaginatedVocabularyDto {
  @ApiProperty({ type: [Vocabulary], description: 'Lista de elementos de vocabulario' })
  items: Vocabulary[];

  @ApiProperty({ description: 'Número total de elementos' })
  total: number;

  @ApiProperty({ description: 'Número de página actual' })
  page: number;

  @ApiProperty({ description: 'Límite de elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Número total de páginas' })
  totalPages: number;
}
