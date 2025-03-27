import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { ReorderContentDto } from './dto/reorder-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentType } from './enums/content-type.enum';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { FileService } from './services/file.service';

@ApiTags('Contenido')
@ApiBearerAuth()
@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
    constructor(
        private readonly contentService: ContentService,
        private readonly fileService: FileService,
    ) { }

    @Post()
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Crear nuevo contenido' })
    @ApiResponse({ status: 201, description: 'Contenido creado exitosamente' })
    async create(@Body() createContentDto: CreateContentDto) {
        return this.contentService.create(createContentDto);
    }

    @Post('upload/:type')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Subir archivo multimedia' })
    @ApiResponse({ status: 201, description: 'Archivo subido exitosamente' })
    @UseInterceptors(FileUploadInterceptor('file', ContentType.VIDEO))
    async uploadFile(
        @Param('type', new ParseEnumPipe(ContentType)) type: ContentType,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }
        const fileName = await this.fileService.saveFile(file, type);
        return { fileName };
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los contenidos' })
    @ApiResponse({ status: 200, description: 'Lista de contenidos' })
    findAll(@Query() paginationDto: PaginationDto) {
        return this.contentService.findAll(paginationDto);
    }

    @Get('lesson/:lessonId')
    @ApiOperation({ summary: 'Obtener contenidos por lección' })
    @ApiResponse({ status: 200, description: 'Lista de contenidos de la lección' })
    findByLesson(
        @Param('lessonId') lessonId: string,
        @Query() paginationDto: PaginationDto,
    ) {
        return this.contentService.findByLesson(lessonId, paginationDto);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener contenidos por tipo' })
    @ApiResponse({ status: 200, description: 'Lista de contenidos del tipo especificado' })
    findByType(
        @Param('type', new ParseEnumPipe(ContentType)) type: ContentType,
        @Query() paginationDto: PaginationDto,
    ) {
        return this.contentService.findByType(type, paginationDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un contenido por ID' })
    @ApiResponse({ status: 200, description: 'Contenido encontrado' })
    findOne(@Param('id') id: string) {
        return this.contentService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Actualizar un contenido' })
    @ApiResponse({ status: 200, description: 'Contenido actualizado' })
    update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
        return this.contentService.update(id, updateContentDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Eliminar un contenido' })
    @ApiResponse({ status: 200, description: 'Contenido eliminado' })
    remove(@Param('id') id: string) {
        return this.contentService.remove(id);
    }

    @Post('reorder')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Reordenar contenidos de una lección' })
    @ApiResponse({ status: 200, description: 'Contenidos reordenados exitosamente' })
    reorderContents(@Body() reorderDto: ReorderContentDto) {
        return this.contentService.reorderContents(reorderDto.items);
    }

    @Patch(':id/toggle-active')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Alternar estado activo del contenido' })
    @ApiResponse({ status: 200, description: 'Estado del contenido actualizado' })
    toggleActive(@Param('id') id: string) {
        return this.contentService.toggleActive(id);
    }

    @Patch(':id/duration')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Actualizar duración del contenido' })
    @ApiResponse({ status: 200, description: 'Duración actualizada exitosamente' })
    updateDuration(
        @Param('id') id: string,
        @Query('duration', ParseEnumPipe) duration: number,
    ) {
        return this.contentService.updateDuration(id, duration);
    }
} 