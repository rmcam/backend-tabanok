import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../../entities/gamification.entity';
import { MentorSpecialization, SpecializationType } from '../../entities/mentor-specialization.entity';
import { Mentor, MentorLevel } from '../../entities/mentor.entity';
import { MentorshipRelation, MentorshipStatus } from '../../entities/mentorship-relation.entity';
import { CulturalRewardService } from '../cultural-reward.service';
import { MentorService } from '../mentor.service';

describe('MentorService', () => {
    let service: MentorService;
    let gamificationRepository: Repository<Gamification>;
    let culturalRewardService: CulturalRewardService;
    let mentorRepository: Repository<Mentor>;
    let specializationRepository: Repository<MentorSpecialization>;
    let mentorshipRepository: Repository<MentorshipRelation>;

    const mockGamificationRepository = {
        findOne: jest.fn(),
        save: jest.fn()
    };

    const mockCulturalRewardService = {
        getCulturalProgress: jest.fn()
    };

    const mockMentor = {
        id: '1',
        userId: 'user1',
        level: MentorLevel.APRENDIZ,
        stats: {
            sessionsCompleted: 0,
            studentsHelped: 0,
            averageRating: 0,
            culturalPointsAwarded: 0
        },
        availability: {
            schedule: [],
            maxStudents: 5
        },
        achievements: [],
        specializations: [],
        mentorshipRelations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
    };

    const mockSpecialization = {
        id: '1',
        type: SpecializationType.DANZA,
        level: 3,
        description: 'Especialización en danza tradicional',
        certifications: [],
        endorsements: [],
        mentor: mockMentor,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MentorService,
                {
                    provide: getRepositoryToken(Gamification),
                    useValue: mockGamificationRepository
                },
                {
                    provide: CulturalRewardService,
                    useValue: mockCulturalRewardService
                },
                {
                    provide: getRepositoryToken(Mentor),
                    useValue: {
                        create: jest.fn().mockReturnValue(mockMentor),
                        save: jest.fn().mockResolvedValue(mockMentor),
                        findOne: jest.fn().mockResolvedValue(mockMentor)
                    }
                },
                {
                    provide: getRepositoryToken(MentorSpecialization),
                    useValue: {
                        create: jest.fn().mockReturnValue(mockSpecialization),
                        save: jest.fn().mockResolvedValue(mockSpecialization)
                    }
                },
                {
                    provide: getRepositoryToken(MentorshipRelation),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<MentorService>(MentorService);
        gamificationRepository = module.get<Repository<Gamification>>(getRepositoryToken(Gamification));
        culturalRewardService = module.get<CulturalRewardService>(CulturalRewardService);
        mentorRepository = module.get<Repository<Mentor>>(getRepositoryToken(Mentor));
        specializationRepository = module.get<Repository<MentorSpecialization>>(
            getRepositoryToken(MentorSpecialization)
        );
        mentorshipRepository = module.get<Repository<MentorshipRelation>>(
            getRepositoryToken(MentorshipRelation)
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkMentorEligibility', () => {
        it('should return eligible when cultural value is sufficient', async () => {
            mockCulturalRewardService.getCulturalProgress.mockResolvedValue({
                culturalValue: 600,
                specializations: ['Preservación de danzas tradicionales']
            });

            const result = await service.checkMentorEligibility('1');
            expect(result).toEqual({
                isEligible: true,
                specializations: ['Preservación de danzas tradicionales']
            });
        });

        it('should return not eligible when cultural value is insufficient', async () => {
            mockCulturalRewardService.getCulturalProgress.mockResolvedValue({
                culturalValue: 400,
                specializations: []
            });

            const result = await service.checkMentorEligibility('1');
            expect(result).toEqual({
                isEligible: false,
                specializations: [],
                reason: 'Se requiere un valor cultural mínimo de 500'
            });
        });
    });

    describe('requestMentorship', () => {
        it('should create mentorship request when mentor is eligible', async () => {
            const mockMentor = {
                userId: '1',
                culturalAchievements: []
            };

            mockGamificationRepository.findOne.mockResolvedValue(mockMentor);
            mockCulturalRewardService.getCulturalProgress.mockResolvedValue({
                culturalValue: 600,
                specializations: ['Preservación de danzas tradicionales']
            });

            const result = await service.requestMentorship(
                '2',
                '1',
                'Preservación de danzas tradicionales'
            );

            expect(result).toEqual(expect.objectContaining({
                mentorId: '1',
                apprenticeId: '2',
                specialization: 'Preservación de danzas tradicionales',
                status: 'pending'
            }));
        });

        it('should throw error when mentor is not found', async () => {
            mockGamificationRepository.findOne.mockResolvedValue(null);

            await expect(
                service.requestMentorship('2', '1', 'Preservación de danzas tradicionales')
            ).rejects.toThrow('Mentor no encontrado');
        });

        it('should throw error when mentor lacks specialization', async () => {
            const mockMentor = {
                userId: '1',
                culturalAchievements: []
            };

            mockGamificationRepository.findOne.mockResolvedValue(mockMentor);
            mockCulturalRewardService.getCulturalProgress.mockResolvedValue({
                culturalValue: 600,
                specializations: ['Otra especialización']
            });

            await expect(
                service.requestMentorship('2', '1', 'Preservación de danzas tradicionales')
            ).rejects.toThrow('El mentor no tiene esta especialización');
        });
    });

    describe('completeMentorshipMission', () => {
        it('should award bonus points to mentor and apprentice', async () => {
            const mockMentor = {
                userId: '1',
                points: 1000,
                recentActivities: []
            };

            const mockApprentice = {
                userId: '2',
                points: 500,
                recentActivities: []
            };

            mockGamificationRepository.findOne
                .mockResolvedValueOnce(mockMentor)
                .mockResolvedValueOnce(mockApprentice);

            await service.completeMentorshipMission('mission-1');

            expect(mockGamificationRepository.save).toHaveBeenCalledTimes(2);
            expect(mockGamificationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    points: 1200, // 1000 + 200 bonus
                    recentActivities: expect.arrayContaining([
                        expect.objectContaining({
                            type: 'mentorship_bonus',
                            description: '¡Bonus por mentoría exitosa!'
                        })
                    ])
                })
            );
        });
    });

    describe('createMentor', () => {
        it('should create a new mentor with specializations', async () => {
            jest.spyOn(mentorRepository, 'findOne').mockResolvedValueOnce(null);

            const createMentorDto = {
                userId: 'user1',
                specializations: [
                    {
                        type: SpecializationType.DANZA,
                        level: 3,
                        description: 'Especialización en danza tradicional'
                    }
                ]
            };

            const result = await service.createMentor(
                createMentorDto.userId,
                createMentorDto.specializations
            );

            expect(result).toEqual(mockMentor);
            expect(mentorRepository.create).toHaveBeenCalled();
            expect(mentorRepository.save).toHaveBeenCalled();
            expect(specializationRepository.create).toHaveBeenCalled();
            expect(specializationRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if mentor already exists', async () => {
            jest.spyOn(mentorRepository, 'findOne').mockResolvedValue(mockMentor);

            await expect(
                service.createMentor('user1', [])
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('getMentorDetails', () => {
        it('should return mentor details', async () => {
            const result = await service.getMentorDetails('1');
            expect(result).toEqual(mockMentor);
        });

        it('should throw NotFoundException if mentor not found', async () => {
            jest.spyOn(mentorRepository, 'findOne').mockResolvedValue(null);

            await expect(
                service.getMentorDetails('999')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateMentorAvailability', () => {
        it('should update mentor availability', async () => {
            const availabilityData = {
                schedule: [
                    {
                        day: 'lunes',
                        hours: ['09:00', '10:00']
                    }
                ],
                maxStudents: 5
            };

            const updatedMentor = {
                ...mockMentor,
                availability: availabilityData
            };

            jest.spyOn(mentorRepository, 'save').mockResolvedValue(updatedMentor);

            const result = await service.updateMentorAvailability('1', availabilityData);
            expect(result.availability).toEqual(availabilityData);
        });

        it('should throw BadRequestException for invalid schedule format', async () => {
            const invalidData = {
                schedule: [
                    {
                        day: 'invalid_day',
                        hours: ['25:00']
                    }
                ],
                maxStudents: 5
            };

            await expect(
                service.updateMentorAvailability('1', invalidData)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('recordSession', () => {
        const mockMentorship = {
            id: '1',
            mentor: mockMentor,
            studentId: 'student1',
            focusArea: SpecializationType.DANZA,
            status: MentorshipStatus.ACTIVE,
            goals: [],
            sessions: [],
            progress: {
                currentLevel: 1,
                pointsEarned: 0,
                skillsLearned: [],
                lastAssessment: new Date()
            },
            startDate: new Date(),
            endDate: null,
            completionCertificate: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should record a new session', async () => {
            jest.spyOn(mentorshipRepository, 'findOne').mockResolvedValue(mockMentorship);

            const sessionData = {
                duration: 60,
                topic: 'Danza tradicional',
                notes: 'Primera sesión completada'
            };

            await service.recordSession('1', sessionData);
            expect(mentorshipRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if mentorship is not active', async () => {
            const inactiveMentorship = {
                ...mockMentorship,
                status: MentorshipStatus.COMPLETED
            };

            jest.spyOn(mentorshipRepository, 'findOne').mockResolvedValue(inactiveMentorship);

            await expect(
                service.recordSession('1', {
                    duration: 60,
                    topic: 'test',
                    notes: 'test'
                })
            ).rejects.toThrow(BadRequestException);
        });
    });
}); 