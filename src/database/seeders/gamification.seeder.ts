import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../auth/entities/user.entity"; // Assuming gamification entities relate to User
import { AchievementProgress } from "../../features/gamification/entities/achievement-progress.entity";
import { Achievement } from "../../features/gamification/entities/achievement.entity";
import { Badge } from "../../features/gamification/entities/badge.entity";
import { BaseAchievement } from "../../features/gamification/entities/base-achievement.entity";
import { CollaborationReward } from "../../features/gamification/entities/collaboration-reward.entity";
import { CulturalAchievement } from "../../features/gamification/entities/cultural-achievement.entity";
import { Gamification } from "../../features/gamification/entities/gamification.entity";
import { Leaderboard } from "../../features/gamification/entities/leaderboard.entity";
import { MentorSpecialization } from "../../features/gamification/entities/mentor-specialization.entity";
import { Mentor } from "../../features/gamification/entities/mentor.entity";
import { MentorshipRelation } from "../../features/gamification/entities/mentorship-relation.entity";
import { MissionTemplate } from "../../features/gamification/entities/mission-template.entity";
import { Mission } from "../../features/gamification/entities/mission.entity";
import { Reward } from "../../features/gamification/entities/reward.entity";
import { Season } from "../../features/gamification/entities/season.entity";
import { SpecialEvent } from "../../features/gamification/entities/special-event.entity";
import { Streak } from "../../features/gamification/entities/streak.entity";
import { UserAchievement } from "../../features/gamification/entities/user-achievement.entity";
import { UserBadge } from "../../features/gamification/entities/user-badge.entity";
import { UserLevel } from "../../features/gamification/entities/user-level.entity";
import { UserMission } from "../../features/gamification/entities/user-mission.entity";
import { UserReward } from "../../features/gamification/entities/user-reward.entity";

@Injectable()
export class GamificationSeeder {
  private firstLoginAchievement: Achievement;
  private lessonCompletedAchievement: Achievement;

  constructor(
    @InjectRepository(AchievementProgress)
    private readonly achievementProgressRepository: Repository<AchievementProgress>,
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(BaseAchievement)
    private readonly baseAchievementRepository: Repository<BaseAchievement>,
    @InjectRepository(CollaborationReward)
    private readonly collaborationRewardRepository: Repository<CollaborationReward>,
    @InjectRepository(CulturalAchievement)
    private readonly culturalAchievementRepository: Repository<CulturalAchievement>,
    @InjectRepository(Gamification)
    private readonly gamificationRepository: Repository<Gamification>,
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,
    @InjectRepository(MentorSpecialization)
    private readonly mentorSpecializationRepository: Repository<MentorSpecialization>,
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(MentorshipRelation)
    private readonly mentorshipRelationRepository: Repository<MentorshipRelation>,
    @InjectRepository(MissionTemplate)
    private readonly missionTemplateRepository: Repository<MissionTemplate>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(SpecialEvent)
    private readonly specialEventRepository: Repository<SpecialEvent>,
    @InjectRepository(Streak)
    private readonly streakRepository: Repository<Streak>,
    @InjectRepository(UserAchievement)
    private readonly userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(UserLevel)
    private readonly userLevelRepository: Repository<UserLevel>,
    @InjectRepository(UserMission)
    private readonly userMissionRepository: Repository<UserMission>,
    @InjectRepository(UserReward)
    private readonly userRewardRepository: Repository<UserReward>,
    @InjectRepository(User) // Inject User repository to link gamification data to users
    private readonly userRepository: Repository<User>
  ) {}

  async seed() {
    console.log("Starting Gamification seeding...");
    // Implement seeding logic for each gamification entity here
    // Need to fetch existing users to link user-specific gamification data

    // Example: Seeding some base achievements
    await this.seedBaseAchievements();
    await this.seedAchievements();
    await this.seedRewards();
    await this.seedBadges();
    await this.seedSeasons();
    await this.seedSpecialEvents();
    await this.seedMissionTemplates();
    // User-specific data like UserAchievement, UserReward, UserBadge, UserLevel, UserMission, Streak, Leaderboard, etc.
    // will require fetching existing users and potentially other seeded data.
    // This part will be more complex and depend on the relationships and data structure.
    // For now, I'll add placeholders and notes.

    console.log("Gamification seeding completed.");
  }

  private async seedBaseAchievements() {
    const baseAchievementsData = [
      {
        name: "First Lesson Completed",
        description: "Complete your first lesson.",
        points: 10,
      },
      {
        name: "First Exercise Completed",
        description: "Complete your first exercise.",
        points: 10,
      },
      // Add more base achievements
    ];
    for (const data of baseAchievementsData) {
      const existing = await this.baseAchievementRepository.findOne({
        where: { name: data.name },
      });
      if (!existing) {
        await this.baseAchievementRepository.save(
          this.baseAchievementRepository.create(data)
        );
      }
    }
  }

  private async seedAchievements() {
    console.log("Seeding Achievements...");
    // Crear logros
    const achievements = await this.achievementRepository.save([
      this.achievementRepository.create({
        name: "Primer Inicio de Sesión",
        description: "Inicia sesión por primera vez",
        requirement: 1,
        bonusPoints: 10,
        criteria: JSON.stringify({ type: "login", value: 1 }),
      }),
      this.achievementRepository.create({
        name: "Lección Completada",
        description: "Completa tu primera lección",
        requirement: 1,
        bonusPoints: 20,
        criteria: JSON.stringify({ type: "lessons_completed", value: 1 }),
      }),
      this.achievementRepository.create({
        name: "Maestro del Vocabulario",
        description: "Aprende 50 palabras nuevas",
        requirement: 50,
        bonusPoints: 50,
        criteria: JSON.stringify({ type: "vocabulary_learned", value: 50 }),
      }),
      this.achievementRepository.create({
        name: "Explorador Cultural",
        description: "Visualiza 3 contenidos culturales",
        requirement: 3,
        bonusPoints: 25,
        criteria: JSON.stringify({ type: "cultural_content_viewed", value: 3 }),
      }),
      this.achievementRepository.create({
        name: "Racha de 7 Días",
        description: "Mantén una racha de aprendizaje por 7 días consecutivos",
        requirement: 7,
        bonusPoints: 30,
        criteria: JSON.stringify({ type: "streak", value: 7 }),
      }),
    ]);

    // Guardar referencias a logros específicos para usarlos en UserAchievement seeding
    this.firstLoginAchievement = achievements.find(
      (ach) => ach.name === "Primer Inicio de Sesión"
    );
    this.lessonCompletedAchievement = achievements.find(
      (ach) => ach.name === "Lección Completada"
    );
    console.log("Achievements seeded.");
  }

  private async seedRewards() {
    console.log("Seeding Rewards...");
    const rewardsData = [
      {
        name: "Completion Bonus",
        description: "Bonus points for completing a module",
        points: 50,
      },
      {
        name: "Perfect Score",
        description: "Awarded for getting a perfect score on an exercise",
        points: 20,
      },
      // Add more rewards
    ];
    for (const data of rewardsData) {
      const existing = await this.rewardRepository.findOne({
        where: { name: data.name },
      });
      if (!existing) {
        await this.rewardRepository.save(this.rewardRepository.create(data));
      }
    }
  }

  private async seedBadges() {
    console.log("Seeding Badges...");
    const badgesData = [
      {
        name: "Quick Learner",
        description: "Awarded for completing lessons quickly",
        imageUrl: "url/to/quick_learner_badge.png",
      },
      {
        name: "Grammar Guru",
        description: "Awarded for mastering grammar exercises",
        imageUrl: "url/to/grammar_guru_badge.png",
      },
      // Add more badges
    ];
    for (const data of badgesData) {
      const existing = await this.badgeRepository.findOne({
        where: { name: data.name },
      });
      if (!existing) {
        await this.badgeRepository.save(this.badgeRepository.create(data));
      }
    }
  }

  private async seedSeasons() {
    console.log("Seeding Seasons...");
    const seasonsData = [
      {
        name: "Spring 2025",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-05-31"),
      },
      {
        name: "Summer 2025",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-08-31"),
      },
      // Add more seasons
    ];
    for (const data of seasonsData) {
      const existing = await this.seasonRepository.findOne({
        where: { name: data.name },
      });
      if (!existing) {
        await this.seasonRepository.save(this.seasonRepository.create(data));
      }
    }
  }

  private async seedSpecialEvents() {
    console.log("Seeding Special Events...");
    const eventsData = [
      {
        name: "Cultural Week",
        description: "Event focused on cultural content",
        startDate: new Date("2025-04-10"),
        endDate: new Date("2025-04-17"),
      },
      {
        name: "Vocabulary Challenge",
        description: "Event focused on expanding vocabulary",
        startDate: new Date("2025-05-05"),
        endDate: new Date("2025-05-12"),
      },
      // Add more special events
    ];
    for (const data of eventsData) {
      const existing = await this.specialEventRepository.findOne({
        where: { name: data.name },
      });
      if (!existing) {
        await this.specialEventRepository.save(
          this.specialEventRepository.create(data)
        );
      }
    }
  }

  private async seedMissionTemplates() {
    console.log("Seeding Mission Templates...");
    const missionTemplatesData = [
      {
        title: "Complete 3 Lessons",
        description: "Finish any 3 lessons",
        rewardPoints: 30,
      },
      {
        title: "Answer 10 Questions",
        description: "Answer 10 questions correctly in exercises",
        rewardPoints: 40,
      },
      // Add more mission templates
    ];
    for (const data of missionTemplatesData) {
      const existing = await this.missionTemplateRepository.findOne({
        where: { title: data.title },
      }); // Revertido: usar 'title' ya que 'name' no existe en la entidad según el linter
      if (!existing) {
        await this.missionTemplateRepository.save(
          this.missionTemplateRepository.create(data)
        );
      }
    }
  }

  // Add methods for other gamification entities (AchievementProgress, CulturalAchievement, Gamification, Leaderboard,
  // MentorSpecialization, Mentor, MentorshipRelation, Mission, Streak, UserAchievement, UserBadge, UserLevel, UserMission, UserReward)
  // These will likely require fetching related entities (Users, BaseAchievements, Missions, etc.)
}
