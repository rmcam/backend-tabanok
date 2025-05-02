import { config } from "dotenv";
import { DataSource } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Account } from "../../features/account/entities/account.entity";
import { Activity } from "../../features/activity/entities/activity.entity";
import { CulturalContent } from "../../features/cultural-content/cultural-content.entity";
import { Exercise } from "../../features/exercises/entities/exercise.entity";
import { Achievement } from "../../features/gamification/entities/achievement.entity";
import { Streak } from "../../features/gamification/entities/streak.entity";
import { UserAchievement } from "../../features/gamification/entities/user-achievement.entity";
import { UserReward } from "../../features/gamification/entities/user-reward.entity";
import { Lesson } from "../../features/lesson/entities/lesson.entity";
import { Multimedia } from "../../features/multimedia/entities/multimedia.entity";
import { Progress } from "../../features/progress/entities/progress.entity";
import { Reward as GamificationReward } from "../../features/gamification/entities/reward.entity"; // Usar la entidad de gamificación
import { Statistics } from "../../features/statistics/entities/statistics.entity";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Unity } from "../../features/unity/entities/unity.entity";
import { Vocabulary } from "../../features/vocabulary/entities/vocabulary.entity";
import { Leaderboard } from "../../features/gamification/entities";


config();

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    Activity,
    Topic,
    Unity,
    Lesson,
    Exercise,
    Progress,
    User,
    Account,
    UserReward,
    UserAchievement,
    Achievement,
    Leaderboard,
    GamificationReward, // Usar la entidad de gamificación
    Vocabulary,
    Multimedia,
    Statistics,
    CulturalContent,
    Streak,
  ],
  synchronize: true,
  ssl:
    process.env.DB_SSL === "true" ||
    process.env.DATABASE_URL?.includes("render.com"),
});

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connection initialized");
    console.log("Seeding will be handled by SeedService.");
    // La lógica de seeding se ha movido a los seeders individuales y SeedService.
    // Este archivo ahora solo inicializa la conexión a la base de datos.
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during database initialization:", error);
    process.exit(1);
  });
