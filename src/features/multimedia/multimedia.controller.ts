import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { MultimediaService } from './multimedia.service';
import { CreateMultimediaDto } from './dto/create-multimedia.dto';
import { UpdateMultimediaDto } from './dto/update-multimedia.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AppPermission } from '../../auth/enums/permission.enum'; // Import AppPermission
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { UserActiveInterface } from '../../common/interfaces/user-active.interface';
import { Multimedia } from './entities/multimedia.entity'; // Importar la entidad Multimedia
import 'multer'; // Importar tipos de Multer

@ApiTags('multimedia')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('multimedia')
export class MultimediaController {
  constructor(private readonly multimediaService: MultimediaService) {}

  @Post('upload')
  @Roles(AppPermission.UPLOAD_MULTIMEDIA)
  @ApiOperation({ summary: 'Subir archivo multimedia' })
  @ApiConsumes('multipart/form-data') // Especificar tipo de contenido
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo multimedia a subir (imagen, video, audio)',
        },
        lessonId: {
          type: 'string', // Asumiendo que lessonId es string/UUID
          description: 'ID de la lección a la que se asocia el archivo (opcional)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo subido exitosamente', type: Multimedia })
  @ApiResponse({ status: 400, description: 'Solicitud inválida o archivo no permitido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1024 * 1024 * 10 }, // Limite de 10MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|mp3|wav)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen, video o audio.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { lessonId?: string }, @ActiveUser() user: UserActiveInterface) {
    const lessonId = body.lessonId; // lessonId es string/UUID
    return this.multimediaService.create(file, user, lessonId); // Pasar lessonId como string | undefined
  }

  @Get()
  @Roles(AppPermission.READ_MULTIMEDIA_LIST)
  @ApiOperation({ summary: 'Obtener todos los archivos multimedia' })
  @ApiResponse({ status: 200, description: 'Lista de archivos multimedia obtenida exitosamente', type: [Multimedia] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  findAll() {
    return this.multimediaService.findAll();
  }

  @Get(':id')
  @Roles(AppPermission.READ_MULTIMEDIA_DETAIL)
  @ApiOperation({ summary: 'Obtener archivo multimedia por ID' })
  @ApiParam({ name: 'id', description: 'ID del archivo multimedia', type: String })
  @ApiResponse({ status: 200, description: 'Archivo multimedia encontrado exitosamente', type: Multimedia })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Archivo multimedia no encontrado' })
  findOne(@Param('id') id: string) {
    return this.multimediaService.findOne(id);
  }

  @Delete(':id')
  @Roles(AppPermission.DELETE_MULTIMEDIA)
  @ApiOperation({ summary: 'Eliminar archivo multimedia por ID' })
  @ApiParam({ name: 'id', description: 'ID del archivo multimedia a eliminar', type: String })
  @ApiResponse({ status: 200, description: 'Archivo multimedia eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Archivo multimedia no encontrado' })
  remove(@Param('id') id: string, @ActiveUser() user: UserActiveInterface) {
    return this.multimediaService.remove(id, user);
  }

  @Get(':id/file')
  @Roles(AppPermission.DOWNLOAD_MULTIMEDIA)
  @ApiOperation({ summary: 'Descargar archivo multimedia por ID' })
  @ApiParam({ name: 'id', description: 'ID del archivo multimedia', type: String })
  @ApiResponse({ status: 200, description: 'Archivo multimedia', content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Archivo multimedia no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al obtener el archivo' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const fileLocation = await this.multimediaService.getFile(id);

      if (fileLocation.startsWith('http://') || fileLocation.startsWith('https://')) {
        res.redirect(fileLocation);
      } else {
        return res.sendFile(fileLocation, { root: './' });
      }

    } catch (error) {
      console.error('Error retrieving file:', error);
      if (error.message === 'Multimedia not found.' || error.message === 'File not found.') {
        res.status(404).send(error.message);
      } else {
        res.status(500).send('Error al obtener el archivo.');
      }
    }
  }
}
