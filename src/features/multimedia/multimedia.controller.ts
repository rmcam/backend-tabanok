import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { MultimediaService } from './multimedia.service';
import { CreateMultimediaDto } from './dto/create-multimedia.dto';
import { UpdateMultimediaDto } from './dto/update-multimedia.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/auth.enum';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { UserActiveInterface } from '../../common/interfaces/user-active.interface'; // Corregido con import type

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.TEACHER)
@Controller('multimedia')
export class MultimediaController {
  constructor(private readonly multimediaService: MultimediaService) {}

  // El método create ahora se maneja en el servicio con el archivo
  // @Post()
  // create(@Body() createMultimediaDto: CreateMultimediaDto) {
  //   return this.multimediaService.create(createMultimediaDto);
  // }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(
    FileInterceptor('file', {
      // La lógica de almacenamiento se ha movido al servicio
      // storage: diskStorage({ ... }),
      limits: { fileSize: 1024 * 1024 * 10 }, // Limite de 10MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|mp3|wav)$/)) {
          // Rechazar archivo si no es una imagen, video o audio
          return cb(new Error('Solo se permiten archivos de imagen, video o audio.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { lessonId?: string }, @ActiveUser() user: UserActiveInterface) {
    // Llamar al servicio para manejar la subida y guardar metadatos
    const lessonId = body.lessonId ? +body.lessonId : undefined;
    return this.multimediaService.create(file, user, lessonId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll() {
    return this.multimediaService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string) {
    return this.multimediaService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Solo administradores pueden eliminar
  remove(@Param('id') id: string, @ActiveUser() user: UserActiveInterface) { // Corregido
    return this.multimediaService.remove(+id, user);
  }

  @Get(':id/file')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const multimediaId = +id; // Convertir el ID de string a number
      const fileLocation = await this.multimediaService.getFile(multimediaId);

      // El servicio ahora lanza excepciones si no encuentra el registro o el archivo
      // No necesitamos verificar fileLocation === null/undefined aquí


      // Determinar si es una ruta local o una URL (S3)
      if (fileLocation.startsWith('http://') || fileLocation.startsWith('https://')) {
        // Es una URL (probablemente S3), redirigir
        res.redirect(fileLocation);
      } else {
        // Es una ruta local, enviar el archivo
        // Nota: Asegúrate de que la ruta local devuelta por el servicio sea correcta
        // para ser usada con res.sendFile. Podría necesitar ajustes.
        return res.sendFile(fileLocation, { root: './' }); // La ruta local completa ya está en fileLocation
      }

    } catch (error) {
      console.error('Error retrieving file:', error);
      // Manejar errores específicos lanzados por el servicio
      if (error.message === 'Multimedia not found.' || error.message === 'File not found.') {
        res.status(404).send(error.message);
      } else {
        res.status(500).send('Error al obtener el archivo.');
      }
    }
  }
}
