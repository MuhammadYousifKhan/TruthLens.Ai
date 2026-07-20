export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Scan: undefined;
  Analyzing: { imageUri: string };
  Result: {
    imageUri: string;
    probability: number;
    confidence: number;
    flags: string[];
    explanation: string;
  };
  Guide: undefined;
  Learn: undefined;
  LessonDetail: { lessonId: string };
  Quiz: { lessonId: string };
  QuizResult: { lessonId: string; score: number; total: number };
  Achievements: undefined;
  Profile: undefined;
};
