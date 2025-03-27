import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ContentVersioningService } from './content-versioning.service';
import { ContentVersion } from './entities/content-version.entity';
import { ChangeType } from './interfaces/content-version.interface';

@ApiTags('Versionado de Contenido')
@Controller('content-versioning')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContentVersioningController {
    constructor(private readonly versioningService: ContentVersioningService) { }

    @Post('create')
    @Roles(Role.EDITOR, Role.ADMIN)
    @ApiOperation({ summary: 'Crear una nueva versión de contenido' })
    @ApiResponse({ status: 201, description: 'Versión creada exitosamente', type: ContentVersion })
    async createVersion(
        @Body() createVersionDto: {
            contentId: string;
            content: {
                original: string;
                translated?: string;
                culturalContext?: string;
                pronunciation?: string;
                audioReference?: string;
                dialectVariation?: string;
            };
            author: string;
            changeType?: ChangeType;
        }
    ): Promise<ContentVersion> {
        return this.versioningService.createVersion(
            createVersionDto.contentId,
            createVersionDto.content,
            createVersionDto.author,
            createVersionDto.changeType
        );
    }

    @Put(':id')
    @Roles(Role.EDITOR, Role.ADMIN)
    @ApiOperation({ summary: 'Actualizar una versión existente' })
    @ApiResponse({ status: 200, description: 'Versión actualizada exitosamente', type: ContentVersion })
    async updateVersion(
        @Param('id') id: string,
        @Body() updateVersionDto: {
            updates: Partial<ContentVersion>;
            author: string;
        }
    ): Promise<ContentVersion> {
        return this.versioningService.updateVersion(
            id,
            updateVersionDto.updates,
            updateVersionDto.author
        );
    }

    @Post('branch/:id')
    @Roles(Role.EDITOR, Role.ADMIN, Role.TRANSLATOR)
    @ApiOperation({ summary: 'Crear una nueva rama desde una versión existente' })
    @ApiResponse({ status: 201, description: 'Rama creada exitosamente', type: ContentVersion })
    async createBranch(
        @Param('id') id: string,
        @Body() createBranchDto: {
            branchName: string;
            author: string;
        }
    ): Promise<ContentVersion> {
        return this.versioningService.createBranch(
            id,
            createBranchDto.branchName,
            createBranchDto.author
        );
    }

    @Post('merge')
    @Roles(Role.EDITOR, Role.ADMIN)
    @ApiOperation({ summary: 'Fusionar una rama con otra versión' })
    @ApiResponse({ status: 200, description: 'Fusión realizada exitosamente', type: ContentVersion })
    async mergeBranch(
        @Body() mergeBranchDto: {
            branchVersionId: string;
            targetVersionId: string;
            author: string;
        }
    ): Promise<ContentVersion> {
        return this.versioningService.mergeBranch(
            mergeBranchDto.branchVersionId,
            mergeBranchDto.targetVersionId,
            mergeBranchDto.author
        );
    }

    @Put('publish/:id')
    @Roles(Role.ADMIN, Role.REVIEWER)
    @ApiOperation({ summary: 'Publicar una versión' })
    @ApiResponse({ status: 200, description: 'Versión publicada exitosamente', type: ContentVersion })
    async publishVersion(
        @Param('id') id: string,
        @Body('author') author: string
    ): Promise<ContentVersion> {
        return this.versioningService.publishVersion(id, author);
    }

    @Get('history/:contentId')
    @Roles(Role.EDITOR, Role.ADMIN, Role.REVIEWER, Role.TRANSLATOR, Role.CULTURAL_EXPERT)
    @ApiOperation({ summary: 'Obtener el historial de versiones de un contenido' })
    @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente', type: [ContentVersion] })
    async getVersionHistory(
        @Param('contentId') contentId: string
    ): Promise<ContentVersion[]> {
        return this.versioningService.getVersionHistory(contentId);
    }

    @Get('compare/:versionId1/:versionId2')
    @Roles(Role.EDITOR, Role.ADMIN, Role.REVIEWER, Role.TRANSLATOR, Role.CULTURAL_EXPERT)
    @ApiOperation({ summary: 'Comparar dos versiones de contenido' })
    @ApiResponse({ status: 200, description: 'Comparación realizada exitosamente' })
    async compareVersions(
        @Param('versionId1') versionId1: string,
        @Param('versionId2') versionId2: string
    ) {
        return this.versioningService.compareVersions(versionId1, versionId2);
    }
} 