import { Test, TestingModule } from '@nestjs/testing';
import { MentorController } from './mentor.controller';
import { MentorService } from '../services/mentor.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CreateMentorDto, AssignStudentDto, UpdateMentorshipStatusDto, RecordSessionDto, UpdateAvailabilityDto } from '../dto/mentor.dto';
import { MentorshipStatus } from '../entities/mentorship-relation.entity';
import { NotFoundException } from '@nestjs/common';
import { SpecializationType } from '../entities/mentor-specialization.entity';

const mockMentorService = {
  createMentor: jest.fn(),
  assignStudent: jest.fn(),
  updateMentorshipStatus: jest.fn(),
  recordSession: jest.fn(),
  getMentorDetails: jest.fn(),
  getMentorStudents: jest.fn(),
  updateMentorAvailability: jest.fn(),
  findAll: jest.fn(),
};

describe('MentorController', () => {
  let controller: MentorController;
  let service: MentorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorController],
      providers: [
        { provide: MentorService, useValue: mockMentorService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<MentorController>(MentorController);
    service = module.get<MentorService>(MentorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMentor', () => {
    it('should create a mentor', async () => {
      const createDto: CreateMentorDto = { userId: 'user-uuid', specializations: [{ type: SpecializationType.LENGUA, level: 3, description: 'Expert' }] }; // Corrected Enum
      const expectedResult = { id: 'mentor-uuid', ...createDto };
      mockMentorService.createMentor.mockResolvedValue(expectedResult);

      const result = await controller.createMentor(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.createMentor).toHaveBeenCalledWith(createDto.userId, createDto.specializations);
    });
  });

  describe('assignStudent', () => {
    it('should assign a student to a mentor', async () => {
      const mentorId = 'mentor-uuid';
      const assignDto: AssignStudentDto = { studentId: 'student-uuid', focusArea: SpecializationType.LENGUA }; // Corrected Enum
      const expectedResult = { id: 'mentorship-uuid', mentorId, studentId: assignDto.studentId, status: MentorshipStatus.PENDING };
      mockMentorService.assignStudent.mockResolvedValue(expectedResult);

      const result = await controller.assignStudent(mentorId, assignDto);

      expect(result).toEqual(expectedResult);
      expect(service.assignStudent).toHaveBeenCalledWith(mentorId, assignDto.studentId, assignDto.focusArea);
    });

    it('should throw NotFoundException if mentor or student not found', async () => {
      const mentorId = 'invalid-mentor';
      const assignDto: AssignStudentDto = { studentId: 'invalid-student', focusArea: SpecializationType.LENGUA }; // Corrected Enum
      mockMentorService.assignStudent.mockRejectedValue(new NotFoundException());

      await expect(controller.assignStudent(mentorId, assignDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMentorshipStatus', () => {
    it('should update mentorship status', async () => {
      const mentorshipId = 'mentorship-uuid';
      const updateDto: UpdateMentorshipStatusDto = { status: MentorshipStatus.ACTIVE };
      const expectedResult = { id: mentorshipId, status: MentorshipStatus.ACTIVE };
      mockMentorService.updateMentorshipStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateMentorshipStatus(mentorshipId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateMentorshipStatus).toHaveBeenCalledWith(mentorshipId, updateDto.status);
    });

     it('should throw NotFoundException if mentorship not found', async () => {
      const mentorshipId = 'invalid-mentorship';
      const updateDto: UpdateMentorshipStatusDto = { status: MentorshipStatus.ACTIVE };
      mockMentorService.updateMentorshipStatus.mockRejectedValue(new NotFoundException());

      await expect(controller.updateMentorshipStatus(mentorshipId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordSession', () => {
    it('should record a mentorship session', async () => {
      const mentorshipId = 'mentorship-uuid';
      const sessionDto: RecordSessionDto = { duration: 60, topic: 'Topic', notes: 'Notes' };
      const expectedResult = { id: 'session-uuid', ...sessionDto };
      mockMentorService.recordSession.mockResolvedValue(expectedResult);

      const result = await controller.recordSession(mentorshipId, sessionDto);

      expect(result).toEqual(expectedResult);
      expect(service.recordSession).toHaveBeenCalledWith(mentorshipId, sessionDto);
    });

     it('should throw NotFoundException if mentorship not found', async () => {
      const mentorshipId = 'invalid-mentorship';
      const sessionDto: RecordSessionDto = { duration: 60, topic: 'Topic', notes: 'Notes' };
      mockMentorService.recordSession.mockRejectedValue(new NotFoundException());

      await expect(controller.recordSession(mentorshipId, sessionDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMentor', () => {
    it('should get mentor details', async () => {
      const mentorId = 'mentor-uuid';
      const expectedResult = { id: mentorId, name: 'Mentor Name' };
      mockMentorService.getMentorDetails.mockResolvedValue(expectedResult);

      const result = await controller.getMentor(mentorId);

      expect(result).toEqual(expectedResult);
      expect(service.getMentorDetails).toHaveBeenCalledWith(mentorId);
    });

     it('should throw NotFoundException if mentor not found', async () => {
      const mentorId = 'invalid-mentor';
      mockMentorService.getMentorDetails.mockRejectedValue(new NotFoundException());

      await expect(controller.getMentor(mentorId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMentorStudents', () => {
    it('should get students for a mentor', async () => {
      const mentorId = 'mentor-uuid';
      const expectedResult = [{ id: 'student-uuid-1' }, { id: 'student-uuid-2' }];
      mockMentorService.getMentorStudents.mockResolvedValue(expectedResult);

      const result = await controller.getMentorStudents(mentorId);

      expect(result).toEqual(expectedResult);
      expect(service.getMentorStudents).toHaveBeenCalledWith(mentorId);
    });

     it('should throw NotFoundException if mentor not found', async () => {
      const mentorId = 'invalid-mentor';
      mockMentorService.getMentorStudents.mockRejectedValue(new NotFoundException());

      await expect(controller.getMentorStudents(mentorId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAvailability', () => {
    it('should update mentor availability', async () => {
      const mentorId = 'mentor-uuid';
      const availabilityDto: UpdateAvailabilityDto = { schedule: [{ day: 'Monday', hours: ['10:00', '11:00'] }], maxStudents: 5 };
      const expectedResult = { success: true };
      mockMentorService.updateMentorAvailability.mockResolvedValue(expectedResult);

      const result = await controller.updateAvailability(mentorId, availabilityDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateMentorAvailability).toHaveBeenCalledWith(mentorId, availabilityDto);
    });

     it('should throw NotFoundException if mentor not found', async () => {
      const mentorId = 'invalid-mentor';
       const availabilityDto: UpdateAvailabilityDto = { schedule: [{ day: 'Monday', hours: ['10:00', '11:00'] }], maxStudents: 5 };
      mockMentorService.updateMentorAvailability.mockRejectedValue(new NotFoundException());

      await expect(controller.updateAvailability(mentorId, availabilityDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return a list of all mentors', async () => {
      const expectedResult = [{ id: 'mentor-1' }, { id: 'mentor-2' }];
      mockMentorService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
