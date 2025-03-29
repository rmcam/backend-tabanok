import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AssignStudentDto, CreateMentorDto, RecordSessionDto, UpdateAvailabilityDto } from '../dto/mentor.dto';
import { MentorshipStatus } from '../entities/mentorship-relation.entity';
import { MentorService } from '../services/mentor.service';

@ApiTags('gamification-mentors')
@Controller('mentors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MentorController {
    constructor(private readonly mentorService: MentorService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear mentor',
        description: 'Registra un nuevo mentor en el sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Mentor creado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async createMentor(@Body() createMentorDto: CreateMentorDto) {
        return this.mentorService.createMentor(
            createMentorDto.userId,
            createMentorDto.specializations
        );
    }

    @Post(':mentorId/students')
    @ApiOperation({
        summary: 'Asignar estudiante',
        description: 'Asigna un estudiante a un mentor específico'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'Identificador único del mentor',
        type: 'string'
    })
    @ApiResponse({
        status: 201,
        description: 'Estudiante asignado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor o estudiante no encontrado'
    })
    async assignStudent(
        @Param('mentorId') mentorId: string,
        @Body() assignStudentDto: AssignStudentDto
    ) {
        return this.mentorService.assignStudent(
            mentorId,
            assignStudentDto.studentId,
            assignStudentDto.focusArea
        );
    }

    @Put('mentorships/:mentorshipId/status')
    @ApiOperation({
        summary: 'Actualizar estado mentoría',
        description: 'Actualiza el estado de una relación de mentoría'
    })
    @ApiParam({
        name: 'mentorshipId',
        description: 'Identificador único de la mentoría',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Estado de mentoría actualizado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentoría no encontrada'
    })
    async updateMentorshipStatus(
        @Param('mentorshipId') mentorshipId: string,
        @Body('status') status: MentorshipStatus
    ) {
        return this.mentorService.updateMentorshipStatus(mentorshipId, status);
    }

    @Post('mentorships/:mentorshipId/sessions')
    @ApiOperation({
        summary: 'Registrar sesión',
        description: 'Registra una nueva sesión de mentoría'
    })
    @ApiParam({
        name: 'mentorshipId',
        description: 'Identificador único de la mentoría',
        type: 'string'
    })
    @ApiResponse({
        status: 201,
        description: 'Sesión registrada exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentoría no encontrada'
    })
    async recordSession(
        @Param('mentorshipId') mentorshipId: string,
        @Body() sessionData: RecordSessionDto
    ) {
        return this.mentorService.recordSession(mentorshipId, sessionData);
    }

    @Get(':mentorId')
    @ApiOperation({
        summary: 'Obtener mentor',
        description: 'Obtiene los detalles de un mentor específico'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'Identificador único del mentor',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalles del mentor obtenidos exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor no encontrado'
    })
    async getMentor(@Param('mentorId') mentorId: string) {
        return this.mentorService.getMentorDetails(mentorId);
    }

    @Get(':mentorId/students')
    @ApiOperation({
        summary: 'Obtener estudiantes por mentor',
        description: 'Obtiene la lista de estudiantes asignados a un mentor específico'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'Identificador único del mentor',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de estudiantes obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor no encontrado'
    })
    async getMentorStudents(@Param('mentorId') mentorId: string) {
        return this.mentorService.getMentorStudents(mentorId);
    }

    @Put(':mentorId/availability')
    @ApiOperation({
        summary: 'Actualizar disponibilidad',
        description: 'Actualiza la disponibilidad horaria de un mentor'
    })
    @ApiParam({
        name: 'mentorId',
        description: 'Identificador único del mentor',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Disponibilidad actualizada exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Mentor no encontrado'
    })
    async updateAvailability(
        @Param('mentorId') mentorId: string,
        @Body() availabilityData: UpdateAvailabilityDto
    ) {
        return this.mentorService.updateMentorAvailability(mentorId, availabilityData);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar mentores',
        description: 'Obtiene la lista de todos los mentores registrados'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de mentores obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    findAll() {
        return this.mentorService.findAll();
    }
} 