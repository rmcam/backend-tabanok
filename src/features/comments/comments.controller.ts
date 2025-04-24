import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@ApiTags('comentarios')
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo comentario' })
    @ApiBody({ type: CreateCommentDto })
    @ApiResponse({ status: 201, description: 'Comentario creado', type: Comment })
    create(@Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.create(createCommentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los comentarios' })
    @ApiResponse({ status: 200, description: 'Lista de comentarios', type: [Comment] })
    findAll() {
        return this.commentsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un comentario por ID' })
    @ApiParam({ name: 'id', description: 'ID del comentario' })
    @ApiResponse({ status: 200, description: 'Comentario encontrado', type: Comment })
    findOne(@Param('id') id: string) {
        return this.commentsService.findOne(id);
    }

    @Get('version/:versionId')
    @ApiOperation({ summary: 'Obtener comentarios por versión' })
    @ApiParam({ name: 'versionId', description: 'ID de la versión' })
    @ApiResponse({ status: 200, description: 'Lista de comentarios de la versión', type: [Comment] })
    findByVersion(@Param('versionId') versionId: string) {
        return this.commentsService.findByVersion(versionId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un comentario' })
    @ApiParam({ name: 'id', description: 'ID del comentario a actualizar' })
    @ApiBody({ type: UpdateCommentDto })
    @ApiResponse({ status: 200, description: 'Comentario actualizado', type: Comment })
    update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
        return this.commentsService.update(id, updateCommentDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un comentario' })
    @ApiParam({ name: 'id', description: 'ID del comentario a eliminar' })
    @ApiResponse({ status: 200, description: 'Comentario eliminado' })
    remove(@Param('id') id: string) {
        return this.commentsService.remove(id);
    }

    @Post(':id/resolve')
    @ApiOperation({ summary: 'Marcar un comentario como resuelto' })
    @ApiParam({ name: 'id', description: 'ID del comentario a resolver' })
    @ApiBody({ schema: { type: 'object', properties: { resolvedBy: { type: 'string', description: 'ID del usuario que resolvió el comentario' } } } })
    @ApiResponse({ status: 200, description: 'Comentario marcado como resuelto', type: Comment })
    resolve(@Param('id') id: string, @Body('resolvedBy') resolvedBy: string) {
        return this.commentsService.resolveComment(id, resolvedBy);
    }

    @Post(':id/reply')
    @ApiOperation({ summary: 'Responder a un comentario' })
    @ApiParam({ name: 'id', description: 'ID del comentario al que se responde' })
    @ApiBody({ type: CreateCommentDto })
    @ApiResponse({ status: 201, description: 'Respuesta creada', type: Comment })
    addReply(@Param('id') id: string, @Body() replyData: CreateCommentDto) {
        return this.commentsService.addReply(id, replyData);
    }

    @Get(':id/thread')
    @ApiOperation({ summary: 'Obtener hilo de comentarios' })
    @ApiParam({ name: 'id', description: 'ID del comentario raíz del hilo' })
    @ApiResponse({ status: 200, description: 'Hilo de comentarios', type: Comment })
    getThread(@Param('id') id: string) {
        return this.commentsService.getCommentThread(id);
    }

    @Get('version/:versionId/unresolved')
    @ApiOperation({ summary: 'Obtener comentarios no resueltos de una versión' })
    @ApiParam({ name: 'versionId', description: 'ID de la versión' })
    @ApiResponse({ status: 200, description: 'Lista de comentarios no resueltos', type: [Comment] })
    getUnresolved(@Param('versionId') versionId: string) {
        return this.commentsService.getUnresolvedComments(versionId);
    }
}
