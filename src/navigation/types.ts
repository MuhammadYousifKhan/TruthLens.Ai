import type { Tell } from "../data/scanContent";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Scan: undefined;
  Analyzing: { imageUri: string };
  Result: {
    imageUri: string;
    imageUrl?: string;
    probability: number;
    confidence: number;
    flags: string[];
    explanation: string;
    tells: Tell[];
    source?: "model" | "offline";
    modelLabel?: string;
  };
  Guide: { imageUri?: string; imageUrl?: string } | undefined;
  Pause: { imageUri?: string; imageUrl?: string } | undefined;
  Learn: undefined;
  LessonDetail: { lessonId: string };
  Quiz: { lessonId: string };
  QuizResult: { lessonId: string; score: number; total: number };
  Achievements: undefined;
  Profile: undefined;
};
