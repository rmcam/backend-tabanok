import { Body, Controller, Get, Param, Post, Put, UseGuards, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AssignStudentDto, CreateMentorDto, RecordSessionDto, UpdateAvailabilityDto, UpdateMentorshipStatusDto } from '../dto/mentor.dto';
import { MentorshipStatus } from '../entities/mentorship-relation.entity';
import { MentorService } from '../services/mentor.service';

@ApiTags('Gamification - Mentors') // Mejorar Tag
@Controller('api/v1/mentors') // Añadir prefijo API
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MentorController {
    constructor(private readonly mentorService: MentorService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear mentor',
        description: 'Registra un nuevo mentor en el sistema. Requiere ID de usuario y especializaciones.'
    })
    @ApiBody({ type: CreateMentorDto })
    @ApiResponse({
        status: 201,
        description: 'Mentor creado exitosamente.'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    async createMentor(@Body(ValidationPipe) createMentorDto: CreateMentorDto) {
        return this.mentorService.createMentor(
            createMentorDto.userId,
            createMentorDto.specializations
        );
    }

    @Post(':mentorId/students')
    @ApiOperation({
        summary: 'Asignar estudiante a mentor',
        description: 'Asigna un estudiante a un mentor específico. Requiere ID de estudiante y área de enfoque.'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'ID del mentor (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiBody({ type: AssignStudentDto })
    @ApiResponse({
        status: 201,
        description: 'Estudiante asignado exitosamente.'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor o estudiante no encontrado, o IDs inválidos.'
    })
    async assignStudent(
        @Param('mentorId', ParseUUIDPipe) mentorId: string,
        @Body(ValidationPipe) assignStudentDto: AssignStudentDto
    ) {
        return this.mentorService.assignStudent(
            mentorId,
            assignStudentDto.studentId,
            assignStudentDto.focusArea
        );
    }

    @Put('mentorships/:mentorshipId/status')
    @ApiOperation({
        summary: 'Actualizar estado de mentoría',
        description: 'Actualiza el estado de una relación de mentoría (ej. activa, inactiva, completada).'
    })
    @ApiParam({
        name: 'mentorshipId',
        description: 'ID de la mentoría (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiBody({ type: UpdateMentorshipStatusDto })
    @ApiResponse({
        status: 200,
        description: 'Estado de mentoría actualizado exitosamente.'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos (ej. estado no válido).'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentoría no encontrada o ID inválido.'
    })
    async updateMentorshipStatus(
        @Param('mentorshipId', ParseUUIDPipe) mentorshipId: string,
        @Body(ValidationPipe) updateStatusDto: UpdateMentorshipStatusDto
    ) {
        return this.mentorService.updateMentorshipStatus(mentorshipId, updateStatusDto.status);
    }

    @Post('mentorships/:mentorshipId/sessions')
    @ApiOperation({
        summary: 'Registrar sesión de mentoría',
        description: 'Registra una nueva sesión de mentoría con detalles como duración y notas.'
    })
    @ApiParam({
        name: 'mentorshipId',
        description: 'ID de la mentoría (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiBody({ type: RecordSessionDto })
    @ApiResponse({
        status: 201,
        description: 'Sesión registrada exitosamente.'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentoría no encontrada o ID inválido.'
    })
    async recordSession(
        @Param('mentorshipId', ParseUUIDPipe) mentorshipId: string,
        @Body(ValidationPipe) sessionData: RecordSessionDto
    ) {
        return this.mentorService.recordSession(mentorshipId, sessionData);
    }

    @Get(':mentorId')
    @ApiOperation({
        summary: 'Obtener detalles de un mentor',
        description: 'Obtiene los detalles de un mentor específico por su ID.'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'ID del mentor (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalles del mentor obtenidos exitosamente.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor no encontrado o ID inválido.'
    })
    async getMentor(@Param('mentorId', ParseUUIDPipe) mentorId: string) {
        return this.mentorService.getMentorDetails(mentorId);
    }

    @Get(':mentorId/students')
    @ApiOperation({
        summary: 'Obtener estudiantes de un mentor',
        description: 'Obtiene la lista de estudiantes asignados a un mentor específico.'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'ID del mentor (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de estudiantes obtenida exitosamente.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor no encontrado o ID inválido.'
    })
    async getMentorStudents(@Param('mentorId', ParseUUIDPipe) mentorId: string) {
        return this.mentorService.getMentorStudents(mentorId);
    }

    @Put(':mentorId/availability')
    @ApiOperation({
        summary: 'Actualizar disponibilidad de mentor',
        description: 'Actualiza la disponibilidad horaria de un mentor.'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'ID del mentor (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiBody({ type: UpdateAvailabilityDto })
    @ApiResponse({
        status: 200,
        description: 'Disponibilidad actualizada exitosamente.'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor no encontrado o ID inválido.'
    })
    async updateAvailability(
        @Param('mentorId', ParseUUIDPipe) mentorId: string,
        @Body(ValidationPipe) availabilityData: UpdateAvailabilityDto
    ) {
        return this.mentorService.updateMentorAvailability(mentorId, availabilityData);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar todos los mentores',
        description: 'Obtiene la lista de todos los mentores registrados en el sistema.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de mentores obtenida exitosamente.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado.'
    })
    findAll() {
        return this.mentorService.findAll();
    }
}
