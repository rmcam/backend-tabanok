import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Import DataSource
import { Achievement } from '../entities/achievement.entity';

@Injectable()
export class AchievementInitializerService implements OnModuleInit {
    constructor(
        @InjectRepository(Achievement)
        private achievementRepository: Repository<Achievement>,
        private dataSource: DataSource // Inject DataSource
    ) { }

    async onModuleInit() {
        await this.initializeAchievements();
    }

    private async initializeAchievements() {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const defaultAchievements = [
                // Logros de nivel
                {
                    name: 'Principiante',
                    description: 'Alcanza el nivel 5',
                    criteria: 'LEVEL_REACHED',
                    requirement: 5,
                    bonusPoints: 100,
                    badge: {
                        id: 'level-5',
                        name: 'Principiante',
                        icon: '🌱',
                        description: 'Has alcanzado el nivel 5'
                    }
                },
                {
                    name: 'Aprendiz',
                    description: 'Alcanza el nivel 10',
                    criteria: 'LEVEL_REACHED',
                    requirement: 10,
                    bonusPoints: 200,
                    badge: {
                        id: 'level-10',
                        name: 'Aprendiz',
                        icon: '🌿',
                        description: 'Has alcanzado el nivel 10'
                    }
                },
                {
                    name: 'Experto',
                    description: 'Alcanza el nivel 20',
                    criteria: 'LEVEL_REACHED',
                    requirement: 20,
                    bonusPoints: 500,
                    badge: {
                        id: 'level-20',
                        name: 'Experto',
                        icon: '🌳',
                        description: 'Has alcanzado el nivel 20'
                    }
                },

                // Logros de lecciones
                {
                    name: 'Estudiante Dedicado',
                    description: 'Completa 50 lecciones',
                    criteria: 'LESSONS_COMPLETED',
                    requirement: 50,
                    bonusPoints: 300,
                    badge: {
                        id: 'lessons-50',
                        name: 'Estudiante Dedicado',
                        icon: '📚',
                        description: 'Has completado 50 lecciones'
                    }
                },
                {
                    name: 'Maestro del Conocimiento',
                    description: 'Completa 100 lecciones',
                    criteria: 'LESSONS_COMPLETED',
                    requirement: 100,
                    bonusPoints: 600,
                    badge: {
                        id: 'lessons-100',
                        name: 'Maestro del Conocimiento',
                        icon: '🎓',
                        description: 'Has completado 100 lecciones'
                    }
                },

                // Logros de puntuaciones perfectas
                {
                    name: 'Precisión',
                    description: 'Obtén 10 puntuaciones perfectas',
                    criteria: 'PERFECT_SCORES',
                    requirement: 10,
                    bonusPoints: 200,
                    badge: {
                        id: 'perfect-10',
                        name: 'Precisión',
                        icon: '🎯',
                        description: 'Has obtenido 10 puntuaciones perfectas'
                    }
                },
                {
                    name: 'Perfeccionista',
                    description: 'Obtén 25 puntuaciones perfectas',
                    criteria: 'PERFECT_SCORES',
                    requirement: 25,
                    bonusPoints: 500,
                    badge: {
                        id: 'perfect-25',
                        name: 'Perfeccionista',
                        icon: '💯',
                        description: 'Has obtenido 25 puntuaciones perfectas'
                    }
                },

                // Logros de racha
                {
                    name: 'Constancia',
                    description: 'Mantén una racha de aprendizaje de 7 días',
                    criteria: 'STREAK_MAINTAINED',
                    requirement: 7,
                    bonusPoints: 150,
                    badge: {
                        id: 'streak-7',
                        name: 'Constancia',
                        icon: '🔥',
                        description: 'Has mantenido una racha de 7 días'
                    }
                },
                {
                    name: 'Dedicación',
                    description: 'Mantén una racha de aprendizaje de 30 días',
                    criteria: 'STREAK_MAINTAINED',
                    requirement: 30,
                    bonusPoints: 1000,
                    badge: {
                        id: 'streak-30',
                        name: 'Dedicación',
                        icon: '🌟',
                        description: 'Has mantenido una racha de 30 días'
                    }
                },

                // Logros de contribuciones culturales
                {
                    name: 'Contribuidor Cultural',
                    description: 'Realiza 5 contribuciones culturales',
                    criteria: 'CULTURAL_CONTRIBUTIONS',
                    requirement: 5,
                    bonusPoints: 200,
                    badge: {
                        id: 'cultural-5',
                        name: 'Contribuidor Cultural',
                        icon: '🎨',
                        description: 'Has realizado 5 contribuciones culturales'
                    }
                },
                {
                    name: 'Guardián Cultural',
                    description: 'Realiza 20 contribuciones culturales',
                    criteria: 'CULTURAL_CONTRIBUTIONS',
                    requirement: 20,
                    bonusPoints: 800,
                    badge: {
                        id: 'cultural-20',
                        name: 'Guardián Cultural',
                        icon: '👑',
                        description: 'Has realizado 20 contribuciones culturales'
                    }
                },

                // Logros de puntos
                {
                    name: 'Coleccionista',
                    description: 'Acumula 1000 puntos',
                    criteria: 'POINTS_EARNED',
                    requirement: 1000,
                    bonusPoints: 100,
                    badge: {
                        id: 'points-1000',
                        name: 'Coleccionista',
                        icon: '💎',
                        description: 'Has acumulado 1000 puntos'
                    }
                },
                {
                    name: 'Leyenda',
                    description: 'Acumula 5000 puntos',
                    criteria: 'POINTS_EARNED',
                    requirement: 5000,
                    bonusPoints: 500,
                }
            ];

            for (const achievement of defaultAchievements) {
                const exists = await queryRunner.manager.findOne(Achievement, {
                    where: { name: achievement.name }
                });

                if (!exists) {
                    await queryRunner.manager.save(Achievement, achievement);
                }
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
