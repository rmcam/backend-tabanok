import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto';
import { Tag } from '../entities/tag.entity';
import { TagType } from '../interfaces/tag.interface';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>
    ) { }

    async create(createTagDto: CreateTagDto): Promise<Tag> {
        // Verificar si ya existe una etiqueta con el mismo nombre y tipo
        const existingTag = await this.tagRepository.findOne({
            where: {
                name: createTagDto.name,
                type: createTagDto.type
            }
        });

        if (existingTag) {
            throw new ConflictException(`Ya existe una etiqueta con el nombre "${createTagDto.name}" para el tipo ${createTagDto.type}`);
        }

        // Verificar etiqueta padre si se especifica
        if (createTagDto.parentId) {
            const parentTag = await this.tagRepository.findOne({
                where: { id: createTagDto.parentId }
            });

            if (!parentTag) {
                throw new NotFoundException(`Etiqueta padre con ID ${createTagDto.parentId} no encontrada`);
            }
        }

        const tag = this.tagRepository.create(createTagDto);
        return this.tagRepository.save(tag);
    }

    async findAll(): Promise<Tag[]> {
        return this.tagRepository.find({
            relations: ['parent']
        });
    }

    async findOne(id: string): Promise<Tag> {
        const tag = await this.tagRepository.findOne({
            where: { id },
            relations: ['parent']
        });

        if (!tag) {
            throw new NotFoundException(`Etiqueta con ID ${id} no encontrada`);
        }

        return tag;
    }

    async findByType(type: TagType): Promise<Tag[]> {
        return this.tagRepository.find({
            where: { type },
            relations: ['parent']
        });
    }

    async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
        const tag = await this.findOne(id);

        // Verificar si el nuevo nombre ya existe para otro tag del mismo tipo
        if (updateTagDto.name && updateTagDto.name !== tag.name) {
            const existingTag = await this.tagRepository.findOne({
                where: {
                    name: updateTagDto.name,
                    type: updateTagDto.type || tag.type,
                    id: Not(id)
                }
            });

            if (existingTag) {
                throw new ConflictException(`Ya existe una etiqueta con el nombre "${updateTagDto.name}" para el tipo ${updateTagDto.type || tag.type}`);
            }
        }

        // Verificar nueva etiqueta padre si se especifica
        if (updateTagDto.parentId && updateTagDto.parentId !== tag.parentId) {
            const parentTag = await this.tagRepository.findOne({
                where: { id: updateTagDto.parentId }
            });

            if (!parentTag) {
                throw new NotFoundException(`Etiqueta padre con ID ${updateTagDto.parentId} no encontrada`);
            }

            // Evitar ciclos en la jerarquía
            if (await this.wouldCreateCycle(id, updateTagDto.parentId)) {
                throw new ConflictException('La nueva relación padre-hijo crearía un ciclo en la jerarquía');
            }
        }

        Object.assign(tag, updateTagDto);
        return this.tagRepository.save(tag);
    }

    async delete(id: string): Promise<void> {
        const tag = await this.findOne(id);

        // Verificar si hay etiquetas hijas
        const hasChildren = await this.tagRepository.count({
            where: { parentId: id }
        });

        if (hasChildren > 0) {
            throw new ConflictException('No se puede eliminar una etiqueta que tiene etiquetas hijas');
        }

        await this.tagRepository.remove(tag);
    }

    async incrementUsageCount(id: string): Promise<Tag> {
        const tag = await this.findOne(id);
        tag.usageCount += 1;
        return this.tagRepository.save(tag);
    }

    async decrementUsageCount(id: string): Promise<Tag> {
        const tag = await this.findOne(id);
        if (tag.usageCount > 0) {
            tag.usageCount -= 1;
            return this.tagRepository.save(tag);
        }
        return tag;
    }

    private async wouldCreateCycle(tagId: string, newParentId: string): Promise<boolean> {
        let currentId = newParentId;
        const visited = new Set<string>();

        while (currentId) {
            if (currentId === tagId) {
                return true; // Se encontró un ciclo
            }

            if (visited.has(currentId)) {
                return false; // Ya visitamos este nodo sin encontrar un ciclo
            }

            visited.add(currentId);

            const parent = await this.tagRepository.findOne({
                where: { id: currentId },
                select: ['parentId']
            });

            if (!parent || !parent.parentId) {
                return false; // Llegamos a un nodo raíz sin encontrar un ciclo
            }

            currentId = parent.parentId;
        }

        return false;
    }

    async findByIds(ids: string[]): Promise<Tag[]> {
        return this.tagRepository.findBy({
            id: In(ids)
        });
    }

    async searchTags(query: string): Promise<Tag[]> {
        return this.tagRepository
            .createQueryBuilder('tag')
            .where('tag.name ILIKE :query', { query: `%${query}%` })
            .orWhere('tag.description ILIKE :query', { query: `%${query}%` })
            .orderBy('tag.usageCount', 'DESC')
            .take(10)
            .getMany();
    }
} 