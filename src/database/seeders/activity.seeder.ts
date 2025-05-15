import { DataSource } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../../auth/entities/user.entity";
import { UserRole } from "../../auth/enums/auth.enum"; // Importar UserRole
import {
  Activity,
  ActivityType,
  DifficultyLevel,
} from "../../features/activity/entities/activity.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";

export class ActivitySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    console.log('Running ActivitySeeder...');
    const activityRepository = this.dataSource.getRepository(Activity);
    // Eliminar actividades existentes
    const activities = await activityRepository.find();
    for (const activity of activities) {
      await activityRepository.remove(activity);
    }
    console.log("Existing activities deleted.");
    const userRepository = this.dataSource.getRepository(User);

    // Obtener usuarios administradores y profesores para asociar las actividades
    const adminUsers = await userRepository.find({
      where: { role: UserRole.ADMIN },
    });
    const teacherUsers = await userRepository.find({
      where: { role: UserRole.TEACHER },
    });
    const contentCreators = [...adminUsers, ...teacherUsers];

    if (contentCreators.length === 0) {
      console.log("No admin or teacher users found. Skipping ActivitySeeder.");
      return;
    }

    const activitiesToSeed = [
      // Actividades de Lectura
      {
        title: "Lectura: El Origen del Maíz",
        description:
          "Lee un mito Kamëntsá sobre el origen del maíz y responde preguntas de comprensión.",
        type: ActivityType.READING,
        difficulty: DifficultyLevel.INTERMEDIATE,
        content: {
          text: "Según la tradición oral Kamëntsá, el maíz fue un regalo de los espíritus...",
          questions: [
            "¿Quién regaló el maíz?",
            "¿Qué importancia tiene el maíz para el pueblo Kamëntsá?",
          ],
        },
        points: 25,
      },
      {
        title: "Lectura: Receta Tradicional",
        description:
          "Lee una receta sencilla en Kamëntsá y describe los pasos.",
        type: ActivityType.READING,
        difficulty: DifficultyLevel.BEGINNER,
        content: {
          text: "Para preparar el mute de maíz, necesitas...",
          questions: [
            "¿Cuál es el primer ingrediente?",
            "¿Cuánto tiempo se cocina?",
          ],
        },
        points: 15,
      },
      {
        title: "Lectura: Noticia Local",
        description:
          "Lee un fragmento de una noticia local en Kamëntsá y resume el contenido.",
        type: ActivityType.READING,
        difficulty: DifficultyLevel.ADVANCED,
        content: {
          text: "El gobernador de Putumayo visitó la comunidad de Sibundoy...",
          questions: [
            "¿Quién visitó la comunidad?",
            "¿Cuál fue el propósito de la visita?",
          ],
        },
        points: 35,
      },

      // Actividades de Escritura
      {
        title: "Escritura: Describe tu Familia",
        description:
          "Escribe un párrafo corto describiendo a los miembros de tu familia en Kamëntsá.",
        type: ActivityType.WRITING,
        difficulty: DifficultyLevel.BEGINNER,
        content: {
          prompt:
            "Describe a tu mamá, papá y hermanos usando el vocabulario aprendido.",
        },
        points: 20,
      },
      {
        title: "Escritura: Mi Día",
        description:
          "Escribe un diario corto sobre tus actividades diarias en Kamëntsá.",
        type: ActivityType.WRITING,
        difficulty: DifficultyLevel.INTERMEDIATE,
        content: {
          prompt:
            "Escribe sobre lo que hiciste hoy, desde que te levantaste hasta ahora.",
        },
        points: 30,
      },
      {
        title: "Escritura: Carta a un Amigo",
        description: "Escribe una carta informal a un amigo en Kamëntsá.",
        type: ActivityType.WRITING,
        difficulty: DifficultyLevel.ADVANCED,
        content: { prompt: "Escribe sobre tus planes para el fin de semana." },
        points: 40,
      },

      // Actividades de Escucha
      {
        title: "Escucha: Conversación Cotidiana",
        description:
          "Escucha una conversación entre dos personas en Kamëntsá y responde preguntas.",
        type: ActivityType.LISTENING,
        difficulty: DifficultyLevel.INTERMEDIATE,
        content: {
          audioUrl: "http://example.com/conversation.mp3",
          questions: ["¿Dónde están las personas?", "¿De qué están hablando?"],
        },
        points: 25,
      },
      {
        title: "Escucha: Canción Tradicional",
        description:
          "Escucha una canción tradicional Kamëntsá y identifica palabras clave.",
        type: ActivityType.LISTENING,
        difficulty: DifficultyLevel.BEGINNER,
        content: {
          audioUrl: "http://example.com/song.mp3",
          questions: [
            "¿Qué palabras reconoces?",
            "¿Cuál es el tema de la canción?",
          ],
        },
        points: 20,
      },
      {
        title: "Escucha: Noticiero Radial",
        description:
          "Escucha un fragmento de un noticiero radial en Kamëntsá y resume las noticias.",
        type: ActivityType.LISTENING,
        difficulty: DifficultyLevel.ADVANCED,
        content: {
          audioUrl: "http://example.com/news.mp3",
          questions: [
            "¿Cuáles son las noticias principales?",
            "¿Qué eventos se mencionan?",
          ],
        },
        points: 35,
      },

      // Actividades de Habla
      {
        title: "Habla: Preséntate",
        description: "Graba un audio presentándote en Kamëntsá.",
        type: ActivityType.SPEAKING,
        difficulty: DifficultyLevel.BEGINNER,
        content: {
          phrases: [
            "Mi nombre es...",
            "Soy de...",
            "Hablo un poco de Kamëntsá.",
          ],
        },
        points: 20,
      },
      {
        title: "Habla: Describe tu Casa",
        description: "Graba un audio describiendo tu casa en Kamëntsá.",
        type: ActivityType.SPEAKING,
        difficulty: DifficultyLevel.INTERMEDIATE,
        content: {
          prompt:
            "Describe las habitaciones, los objetos y las personas en tu casa.",
        },
        points: 30,
      },
      {
        title: "Habla: Narra un Evento",
        description: "Graba un audio narrando un evento reciente en Kamëntsá.",
        type: ActivityType.SPEAKING,
        difficulty: DifficultyLevel.ADVANCED,
        content: { prompt: "Cuenta lo que hiciste el fin de semana pasado." },
        points: 40,
      },

      // Actividades Culturales
      {
        title: "Cultural: Vestimenta Tradicional",
        description: "Investiga y describe la vestimenta tradicional Kamëntsá.",
        type: ActivityType.CULTURAL,
        difficulty: DifficultyLevel.INTERMEDIATE,
        content: {
          explanation: "La vestimenta tradicional varía según la ocasión...",
          researchPrompt:
            "Describe los elementos principales de la vestimenta tradicional y su significado.",
        },
        points: 30,
      },
      {
        title: "Cultural: Instrumentos Musicales",
        description:
          "Identifica y describe los instrumentos musicales tradicionales Kamëntsá.",
        type: ActivityType.CULTURAL,
        difficulty: DifficultyLevel.BEGINNER,
        content: {
          explanation: "La música Kamëntsá utiliza varios instrumentos...",
          researchPrompt:
            "Nombra al menos tres instrumentos y describe cómo se usan.",
        },
        points: 25,
      },

      // Actividades Interactivas
      {
        title: "Interactiva: Empareja Imágenes y Palabras",
        description:
          "Empareja imágenes de objetos con sus nombres en Kamëntsá.",
        type: ActivityType.INTERACTIVE,
        difficulty: DifficultyLevel.BEGINNER,
        content: {
          pairs: [
            { imageUrl: "http://example.com/house.jpg", kamensta: "Casa" },
            { imageUrl: "http://example.com/dog.jpg", kamensta: "Perro" },
          ],
        },
        points: 20,
      },
      {
        title: "Interactiva: Completa la Oración",
        description: "Completa oraciones en Kamëntsá con la palabra correcta.",
        type: ActivityType.INTERACTIVE,
        difficulty: DifficultyLevel.INTERMEDIATE,
        content: {
          sentences: [
            {
              text: "El perro ___ en la casa.",
              options: ["está", "come", "duerme"],
              answer: "está",
            },
          ],
        },
        points: 25,
      },
    ];

    for (let i = 0; i < activitiesToSeed.length; i++) {
      const activityData = activitiesToSeed[i];
      const existingActivity = await activityRepository.findOne({
        where: { title: activityData.title },
      });

      if (!existingActivity) {
        // Asignar un creador de contenido de forma rotatoria
        const creator = contentCreators[i % contentCreators.length];
        const newActivity = new Activity();
        newActivity.id = uuidv4();
        Object.assign(newActivity, activityData);
        newActivity.user = creator;
        newActivity.userId = creator.id;
        await activityRepository.save(newActivity);
        console.log(
          `Activity "${activityData.title}" seeded by user "${creator.email}".`
        );
      } else {
        console.log(
          `Activity "${existingActivity.title}" already exists. Skipping.`
        );
      }
    }
  }
}

