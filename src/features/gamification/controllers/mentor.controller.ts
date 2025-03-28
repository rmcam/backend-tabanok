import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AssignStudentDto, CreateMentorDto, RecordSessionDto, UpdateAvailabilityDto } from '../dto/mentor.dto';
import { MentorshipStatus } from '../entities/mentorship-relation.entity';
import { MentorService } from '../services/mentor.service';

@Controller('mentors')
@UseGuards(JwtAuthGuard)
export class MentorController {
    constructor(private readonly mentorService: MentorService) { }

    @Post()
    async createMentor(@Body() createMentorDto: CreateMentorDto) {
        return this.mentorService.createMentor(
            createMentorDto.userId,
            createMentorDto.specializations
        );
    }

    @Post(':mentorId/students')
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
    async updateMentorshipStatus(
        @Param('mentorshipId') mentorshipId: string,
        @Body('status') status: MentorshipStatus
    ) {
        return this.mentorService.updateMentorshipStatus(mentorshipId, status);
    }

    @Post('mentorships/:mentorshipId/sessions')
    async recordSession(
        @Param('mentorshipId') mentorshipId: string,
        @Body() sessionData: RecordSessionDto
    ) {
        return this.mentorService.recordSession(mentorshipId, sessionData);
    }

    @Get(':mentorId')
    async getMentor(@Param('mentorId') mentorId: string) {
        return this.mentorService.getMentorDetails(mentorId);
    }

    @Get(':mentorId/students')
    async getMentorStudents(@Param('mentorId') mentorId: string) {
        return this.mentorService.getMentorStudents(mentorId);
    }

    @Put(':mentorId/availability')
    async updateAvailability(
        @Param('mentorId') mentorId: string,
        @Body() availabilityData: UpdateAvailabilityDto
    ) {
        return this.mentorService.updateMentorAvailability(mentorId, availabilityData);
    }
} 