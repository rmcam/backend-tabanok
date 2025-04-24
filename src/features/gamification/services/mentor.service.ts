import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';
import { MentorSpecialization, SpecializationType } from '../entities/mentor-specialization.entity';
import { Mentor, MentorLevel } from '../entities/mentor.entity';
import { MentorshipRelation, MentorshipStatus, MentorshipType } from '../entities/mentorship-relation.entity';
import { CulturalRewardService } from './cultural-reward.service';

interface MentorshipRequest {
    mentorId: string;
    apprenticeId: string;
    specialization: string;
    type: MentorshipType;
    status: 'pending' | 'accepted' | 'completed' | 'rejected';
    createdAt: Date;
}

interface MentorshipMission {
    id: string;
    title: string;
    description: string;
    specialization: string;
    mentorId: string;
    apprenticeId: string;
    progress: number;
    completedAt?: Date;
}

import {GamificationRepository} from '../repositories/gamification.repository';

@Injectable()
export class MentorService {
    private readonly MENTOR_CULTURAL_VALUE_THRESHOLD = 500;
    private readonly MENTORSHIP_BONUS_POINTS = 200;

    constructor(
        private readonly gamificationRepository: GamificationRepository,
        private readonly culturalRewardService: CulturalRewardService,
        @InjectRepository(Mentor)
        private mentorRepository: Repository<Mentor>,
        @InjectRepository(MentorSpecialization)
        private specializationRepository: Repository<MentorSpecialization>,
        @InjectRepository(MentorshipRelation)
        private mentorshipRepository: Repository<MentorshipRelation>
    ) { }

    async checkMentorEligibility(userId: string, type: MentorshipType): Promise<{
        isEligible: boolean;
        specializations: string[];
        reason?: string;
    }> {
        const progress = await this.culturalRewardService.getCulturalProgress(userId);

        if (type === MentorshipType.DOCENTE_ESTUDIANTE && progress.culturalValue < this.MENTOR_CULTURAL_VALUE_THRESHOLD) {
            return {
                isEligible: false,
                specializations: [],
                reason: `Se requiere un valor cultural mínimo de ${this.MENTOR_CULTURAL_VALUE_THRESHOLD}`
            };
        }
        // Add logic for ESTUDIANTE_ESTUDIANTE eligibility if needed

        return {
            isEligible: true,
            specializations: progress.specializations
        };
    }

    async requestMentorship(
        apprenticeId: string,
        mentorId: string,
        specialization: string,
        type: MentorshipType
    ): Promise<MentorshipRequest> {
         if (!Object.values(MentorshipType).includes(type)) {
            throw new BadRequestException(`Invalid mentorship type: ${type}`);
        }

        const mentor = await this.gamificationRepository.findOne(mentorId);

        if (!mentor) {
            throw new NotFoundException('Mentor no encontrado');
        }

        const eligibility = await this.checkMentorEligibility(mentorId, type);
        if (!eligibility.isEligible) {
            throw new Error('El usuario seleccionado no es elegible como mentor');
        }

        if (!eligibility.specializations.includes(specialization)) {
            throw new Error('El mentor no tiene esta especialización');
        }

        const request: MentorshipRequest = {
            mentorId,
            apprenticeId,
            specialization,
            type,
            status: 'pending',
            createdAt: new Date()
        };

        // Aquí se podría agregar la lógica para guardar la solicitud en la base de datos
        return request;
    }

    async createMentorshipMission(
        mentorId: string,
        apprenticeId: string,
        missionData: Partial<MentorshipMission>
    ): Promise<MentorshipMission> {
        const eligibility = await this.checkMentorEligibility(mentorId, MentorshipType.DOCENTE_ESTUDIANTE);
        if (!eligibility.isEligible) {
            throw new Error('No tienes los requisitos para crear misiones de mentoría');
        }

        const mission: MentorshipMission = {
            id: Date.now().toString(), // Simplificado para el ejemplo
            title: missionData.title,
            description: missionData.description,
            specialization: missionData.specialization,
            mentorId,
            apprenticeId,
            progress: 0
        };

        // Aquí se podría agregar la lógica para guardar la misión en la base de datos
        return mission;
    }

    async completeMentorshipMission(missionId: string): Promise<void> {
        // Simulación de completar una misión de mentoría
        // Aquí iría la lógica real para actualizar la misión en la base de datos

        // Otorgar puntos bonus al mentor y aprendiz
        const mission = { mentorId: '1', apprenticeId: '2', type: MentorshipType.DOCENTE_ESTUDIANTE }; // Simulado
        await Promise.all([
            this.awardMentorshipBonus(mission.mentorId, 'mentor', mission.type),
            this.awardMentorshipBonus(mission.apprenticeId, 'apprentice', mission.type)
        ]);
    }

    private async awardMentorshipBonus(userId: string, role: 'mentor' | 'apprentice', type: MentorshipType): Promise<void> {
        const gamification = await this.gamificationRepository.findOne(userId);

        if (!gamification) return;

        let bonusPoints = role === 'mentor'
            ? this.MENTORSHIP_BONUS_POINTS
            : Math.floor(this.MENTORSHIP_BONUS_POINTS * 0.8);

        if (type === MentorshipType.ESTUDIANTE_ESTUDIANTE) {
            bonusPoints = bonusPoints * 0.5; // Reducir el bonus para mentorías entre estudiantes
        }

        gamification.points += bonusPoints;
        gamification.recentActivities.unshift({
            type: 'mentorship_bonus',
            description: role === 'mentor'
                ? '¡Bonus por mentoría exitosa!'
                : '¡Bonus por completar mentoría!',
            pointsEarned: bonusPoints,
            timestamp: new Date()
        });

        await this.gamificationRepository.save(gamification);
    }

    async createMentor(userId: string, initialSpecializations: { type: SpecializationType; level: number; description: string }[]): Promise<Mentor> {
        // Verificar si el usuario ya es mentor
        const existingMentor = await this.mentorRepository.findOne({ where: {userId}});
        if (existingMentor) {
            throw new BadRequestException('El usuario ya es un mentor');
        }

        // Crear nuevo mentor
        const mentor = this.mentorRepository.create({
            userId,
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
            achievements: []
        });

        const savedMentor = await this.mentorRepository.save(mentor);

        // Crear especializaciones iniciales
        for (const spec of initialSpecializations) {
            const specialization = this.specializationRepository.create({
                mentor:savedMentor,
                type: spec.type,
                level: spec.level,
                description: spec.description,
                certifications: [],
                endorsements: []
            });
            await this.specializationRepository.save(specialization);
        }

        return savedMentor;
    }

    async assignStudent(mentorId: string, studentId: string, focusArea: SpecializationType): Promise<MentorshipRelation> {
        const mentor = await this.mentorRepository.findOne({
            where: { id: mentorId },
            relations: ['mentorshipRelations', 'specializations']
        });

        if (!mentor) {
            throw new NotFoundException('Mentor no encontrado');
        }

        // Verificar disponibilidad del mentor
        const activeRelations = mentor.mentorshipRelations.filter(
            rel => rel.status === MentorshipStatus.ACTIVE
        );

        if (activeRelations.length >= mentor.availability.maxStudents) {
            throw new BadRequestException('El mentor ha alcanzado su límite máximo de estudiantes');
        }

        // Verificar que el mentor tenga la especialización requerida
        const hasSpecialization = mentor.specializations.some(spec => spec.type === focusArea);
        if (!hasSpecialization) {
            throw new BadRequestException('El mentor no tiene la especialización requerida');
        }

        // Crear nueva relación de mentoría
        const mentorship = this.mentorshipRepository.create({
            mentor,
            studentId,
            focusArea,
            status: MentorshipStatus.PENDING,
            goals: [],
            sessions: [],
            progress: {
                currentLevel: 1,
                pointsEarned: 0,
                skillsLearned: [],
                lastAssessment: new Date()
            }
        });

        return this.mentorshipRepository.save(mentorship);
    }

    async updateMentorshipStatus(mentorshipId: string, status: MentorshipStatus): Promise<MentorshipRelation> {
        const mentorship = await this.mentorshipRepository.findOne({
            where: { id: mentorshipId },
            relations: ['mentor']
        });

        if (!mentorship) {
            throw new NotFoundException('Relación de mentoría no encontrada');
        }

        mentorship.status = status;

        if (status === MentorshipStatus.ACTIVE) {
            mentorship.startDate = new Date();
        } else if (status === MentorshipStatus.COMPLETED) {
            mentorship.endDate = new Date();
            // Actualizar estadísticas del mentor
            await this.updateMentorStats(mentorship.mentor.id);
        }

        return this.mentorshipRepository.save(mentorship);
    }

    async recordSession(
        mentorshipId: string,
        sessionData: {
            duration: number;
            topic: string;
            notes: string;
        }
    ): Promise<MentorshipRelation> {
        const mentorship = await this.mentorshipRepository.findOne({
            where: { id: mentorshipId }
        });

        if (!mentorship) {
            throw new NotFoundException('Relación de mentoría no encontrada');
        }

        if (mentorship.status !== MentorshipStatus.ACTIVE) {
            throw new BadRequestException('La mentoría no está activa');
        }

        const session = {
            ...sessionData,
            date: new Date()
        };

        mentorship.sessions.push(session);
        return this.mentorshipRepository.save(mentorship);
    }

    private async updateMentorStats(mentorId: string): Promise<void> {
        const mentor = await this.mentorRepository.findOne({
            where: { id: mentorId },
            relations: ['mentorshipRelations']
        });

        if (!mentor) {
            throw new NotFoundException('Mentor no encontrado');
        }

        const completedMentorships = mentor.mentorshipRelations.filter(
            rel => rel.status === MentorshipStatus.COMPLETED
        );

        // Calcular estadísticas
        const totalSessions = completedMentorships.reduce(
            (sum, rel) => sum + rel.sessions.length,
            0
        );

        const ratings = completedMentorships
            .flatMap(rel => rel.sessions)
            .map(session => session.rating)
            .filter(rating => rating !== undefined);

        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;

        // Actualizar estadísticas
        mentor.stats = {
            sessionsCompleted: totalSessions,
            studentsHelped: completedMentorships.length,
            averageRating,
            culturalPointsAwarded: totalSessions * 10 // Ejemplo simple de cálculo de puntos
        };

        // Actualizar nivel del mentor basado en las estadísticas
        this.updateMentorLevel(mentor);

        await this.mentorRepository.save(mentor);
    }

    private updateMentorLevel(mentor: Mentor): void {
        const { sessionsCompleted, studentsHelped, averageRating } = mentor.stats;

        // Lógica para determinar el nivel del mentor
        if (sessionsCompleted >= 100 && studentsHelped >= 20 && averageRating >= 4.5) {
            mentor.level = MentorLevel.SABEDOR;
        } else if (sessionsCompleted >= 50 && studentsHelped >= 10 && averageRating >= 4.0) {
            mentor.level = MentorLevel.MAESTRO;
        } else if (sessionsCompleted >= 25 && studentsHelped >= 5 && averageRating >= 3.5) {
            mentor.level = MentorLevel.AVANZADO;
        } else if (sessionsCompleted >= 10 && studentsHelped >= 2 && averageRating >= 3.0) {
            mentor.level = MentorLevel.INTERMEDIO;
        }
    }

    async getMentorDetails(mentorId: string): Promise<Mentor> {
        const mentor = await this.mentorRepository.findOne({
            where: { id: mentorId },
            relations: ['specializations', 'mentorshipRelations']
        });

        if (!mentor) {
            throw new NotFoundException('Mentor no encontrado');
        }

        return mentor;
    }

    async getMentorStudents(mentorId: string): Promise<{
        active: MentorshipRelation[];
        completed: MentorshipRelation[];
        pending: MentorshipRelation[];
    }> {
        const mentor = await this.mentorRepository.findOne({
            where: { id: mentorId },
            relations: ['mentorshipRelations']
        });

        if (!mentor) {
            throw new NotFoundException('Mentor no encontrado');
        }

        const relations = mentor.mentorshipRelations || [];

        return {
            active: relations.filter(rel => rel.status === MentorshipStatus.ACTIVE),
            completed: relations.filter(rel => rel.status === MentorshipStatus.COMPLETED),
            pending: relations.filter(rel => rel.status === MentorshipStatus.PENDING)
        };
    }

    async updateMentorAvailability(
        mentorId: string,
        availabilityData: {
            schedule: { day: string; hours: string[] }[];
            maxStudents: number;
        }
    ): Promise<Mentor> {
        const mentor = await this.mentorRepository.findOne({
            where: { id: mentorId }
        });

        if (!mentor) {
            throw new NotFoundException('Mentor no encontrado');
        }

        // Validar el horario
        for (const scheduleItem of availabilityData.schedule) {
            if (!['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].includes(scheduleItem.day.toLowerCase())) {
                throw new BadRequestException(`Día inválido: ${scheduleItem.day}`);
            }

            for (const hour of scheduleItem.hours) {
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(hour)) {
                    throw new BadRequestException(`Formato de hora inválido: ${hour}. Use formato HH:MM`);
                }
            }
        }

        mentor.availability = availabilityData;
        return this.mentorRepository.save(mentor);
    }

    async findAll(): Promise<Mentor[]> {
        return await this.mentorRepository.find({
            relations: ['specializations', 'mentorshipRelations']
        });
    }
}
