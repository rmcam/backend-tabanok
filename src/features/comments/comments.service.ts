import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEventType } from '../webhooks/interfaces/webhook.interface';
import { WebhooksService } from '../webhooks/webhooks.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        private webhooksService: WebhooksService
    ) { }

    async create(createCommentDto: CreateCommentDto): Promise<Comment> {
        const comment = this.commentRepository.create({
            ...createCommentDto,
            mentions: [],
            attachments: [],
            metadata: {},
            isResolved: false
        });

        const savedComment = await this.commentRepository.save(comment);

        // Notificar a través de webhooks
        await this.webhooksService.triggerEvent(WebhookEventType.COMMENT_ADDED, {
            commentId: savedComment.id,
            versionId: savedComment.versionId,
            author: savedComment.author,
            content: savedComment.content,
            mentions: savedComment.mentions || []
        });

        return savedComment;
    }

    async findAll() {
        return this.commentRepository.find({
            relations: ['version', 'replies']
        });
    }

    async findOne(id: string) {
        return this.commentRepository.findOne({
            where: { id },
            relations: ['version', 'replies']
        });
    }

    async findByVersion(versionId: string) {
        return this.commentRepository.find({
            where: { versionId },
            relations: ['replies']
        });
    }

    async findByAuthor(author: string) {
        return this.commentRepository.find({
            where: { author },
            relations: ['version', 'replies']
        });
    }

    async update(id: string, updateCommentDto: UpdateCommentDto) {
        await this.commentRepository.update(id, updateCommentDto);
        return this.findOne(id);
    }

    async remove(id: string) {
        const comment = await this.findOne(id);
        if (!comment) {
            throw new NotFoundException(`Comentario ${id} no encontrado`);
        }
        return this.commentRepository.remove(comment);
    }

    async resolveComment(id: string, resolvedBy: string) {
        const comment = await this.findOne(id);
        if (!comment) {
            throw new NotFoundException(`Comentario ${id} no encontrado`);
        }

        comment.isResolved = true;
        comment.resolvedBy = resolvedBy;
        comment.resolvedAt = new Date();

        return this.commentRepository.save(comment);
    }

    async addMention(id: string, userId: string) {
        const comment = await this.findOne(id);
        if (!comment) {
            throw new NotFoundException(`Comentario ${id} no encontrado`);
        }

        if (!comment.mentions) {
            comment.mentions = [];
        }
        comment.mentions.push(userId);
        return this.commentRepository.save(comment);
    }

    async addAttachment(id: string, attachmentUrl: string) {
        const comment = await this.findOne(id);
        if (!comment) {
            throw new NotFoundException(`Comentario ${id} no encontrado`);
        }

        if (!comment.attachments) {
            comment.attachments = [];
        }
        comment.attachments.push(attachmentUrl);
        return this.commentRepository.save(comment);
    }

    async updateMetadata(id: string, metadata: any) {
        const comment = await this.findOne(id);
        if (!comment) {
            throw new NotFoundException(`Comentario ${id} no encontrado`);
        }

        comment.metadata = { ...comment.metadata, ...metadata };
        return this.commentRepository.save(comment);
    }

    async getCommentsByVersion(versionId: string): Promise<Comment[]> {
        return this.commentRepository.find({
            where: { versionId },
            relations: ['replies'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getCommentThread(commentId: string): Promise<Comment> {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['replies', 'replies.replies']
        });

        if (!comment) {
            throw new NotFoundException(`Comentario ${commentId} no encontrado`);
        }

        return comment;
    }

    async getUnresolvedComments(versionId: string): Promise<Comment[]> {
        return this.commentRepository.find({
            where: {
                versionId,
                isResolved: false
            },
            order: {
                createdAt: 'ASC'
            }
        });
    }

    async addReply(
        parentId: string,
        replyData: CreateCommentDto
    ): Promise<Comment> {
        const parent = await this.commentRepository.findOne({ where: { id: parentId } });

        if (!parent) {
            throw new NotFoundException(`Comentario padre ${parentId} no encontrado`);
        }

        const reply = this.commentRepository.create({
            ...replyData,
            parentId,
            versionId: parent.versionId
        });

        return this.commentRepository.save(reply);
    }
} 