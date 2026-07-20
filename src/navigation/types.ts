export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Scan: undefined;
  Analyzing: { imageUri: string };
  Result: { scanId: string };
  Guide: undefined;
  Learn: undefined;
  LessonDetail: { lessonId: string };
  Quiz: { lessonId: string };
  QuizResult: { lessonId: string; score: number; total: number };
  Achievements: undefined;
  Profile: undefined;
};
