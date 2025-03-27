export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
  feedback?: string;
}

export interface MemoryCard {
  wordKamentsa: string;
  wordSpanish: string;
  imageUrl?: string;
  points: number;
}

export interface WordPair {
  kamentsa: string;
  spanish: string;
  points: number;
}

export interface PronunciationExercise {
  wordKamentsa: string;
  audioUrl: string;
  transcription: string;
  points: number;
}

export interface CulturalStory {
  title: string;
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  questions: QuizQuestion[];
  points: number;
}

export interface ActivityContent {
  // Quiz de vocabulario
  questions?: QuizQuestion[];
  
  // Juego de memoria
  cards?: MemoryCard[];
  
  // Emparejamiento de palabras
  pairs?: WordPair[];
  
  // Práctica de pronunciación
  pronunciationExercises?: PronunciationExercise[];
  
  // Historia cultural
  story?: CulturalStory;
  
  // Configuración general
  timeLimit?: number; // Tiempo límite en segundos
  minScore?: number; // Puntuación mínima para aprobar
  maxAttempts?: number; // Número máximo de intentos
} 