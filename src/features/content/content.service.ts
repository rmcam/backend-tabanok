import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './entities/content.entity';
import { ContentRepository } from './content.repository'; // Importar el repositorio personalizado

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: ContentRepository, // Usar el repositorio personalizado
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    // Validar la estructura del contenido antes de crear
    if (createContentDto.content) {
      this.validateContentStructure(createContentDto.type, createContentDto.content);
    }
    const content = this.contentRepository.create(createContentDto);
    return this.contentRepository.save(content);
  }

  async findAll(): Promise<Content[]> {
    return this.contentRepository.find();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content with ID "${id}" not found`);
    }
    return content;
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    const content = await this.findOne(id); // Reutilizar findOne para verificar existencia

    // Validar la estructura del contenido si se proporciona en la actualización
    if (updateContentDto.content !== undefined) { // Usar !== undefined para permitir null
       // Usar el tipo existente si no se proporciona uno nuevo
      const contentType = updateContentDto.type !== undefined ? updateContentDto.type : content.type;
      this.validateContentStructure(contentType, updateContentDto.content);
    } else if (updateContentDto.type !== undefined) {
        // Si solo se actualiza el tipo, validar con el contenido existente
        this.validateContentStructure(updateContentDto.type, content.content);
    }


    this.contentRepository.merge(content, updateContentDto);
    return this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Content with ID "${id}" not found`);
    }
  }

  private validateContentStructure(type: string, content: any): void {
    // Lógica de validación basada en el tipo de contenido
    switch (type) {
      case 'text':
        if (typeof content !== 'object' || !content.hasOwnProperty('text') || typeof content.text !== 'string') {
          throw new BadRequestException('Invalid structure for text content');
        }
        break;
      case 'video':
        if (typeof content !== 'object' || !content.hasOwnProperty('url') || typeof content.url !== 'string') {
          throw new BadRequestException('Invalid structure for video content');
        }
        // Podríamos añadir más validaciones, como formato de URL, etc.
        break;
      case 'quiz':
        if (typeof content !== 'object' || !Array.isArray(content.questions) || content.questions.length === 0) {
           throw new BadRequestException('Invalid structure for quiz content: missing or empty questions array');
        }
        // Validación más detallada de la estructura de las preguntas y respuestas
        for (const question of content.questions) {
            if (typeof question !== 'object' || !question.hasOwnProperty('text') || typeof question.text !== 'string' || !Array.isArray(question.options) || question.options.length === 0) {
                throw new BadRequestException('Invalid structure for quiz content: invalid question format');
            }
            for (const option of question.options) {
                if (typeof option !== 'object' || !option.hasOwnProperty('text') || typeof option.text !== 'string' || !option.hasOwnProperty('isCorrect') || typeof option.isCorrect !== 'boolean') {
                    throw new BadRequestException('Invalid structure for quiz content: invalid option format');
                }
            }
        }
        break;
      // Añadir más casos según los tipos de contenido definidos
      default:
        // Si el tipo no es reconocido, podríamos lanzar una excepción o permitir cualquier JSON
        // Por ahora, permitiremos cualquier JSON para tipos no definidos explícitamente
        // throw new BadRequestException(`Unsupported content type: ${type}`);
        break;
    }
  }

  async findByUnityAndTopic(unityId: string, topicId: string): Promise<Content[]> {
    return this.contentRepository.findByUnityAndTopic(unityId, topicId);
  }
}
