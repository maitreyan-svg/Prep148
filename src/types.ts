export type SubjectType = 'physics' | 'chemistry' | 'mathematics';
export type ProfileType = string;

export type DayStatus = 'completed' | 'in-progress' | 'rest' | 'untracked';

export interface Chapter {
  id: string;
  name: string;
  subject: SubjectType;
  lecturesCompleted: number;
  lecturesTotal: number;
  pyqsMode: 'toggle' | 'ratio';
  pyqsCompleted: number;
  pyqsTotal: number;
  pyqsDone: boolean;
  shortNotes: boolean; // Made (true) / Not Made (false)
  revisionCount: number; // 0, 1, 2, 3...
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTask {
  id: string;
  text: string;
  done: boolean;
  subject?: SubjectType | 'general';
}

export interface MockTestDetails {
  testName: string;
  testType: 'full' | 'part' | 'chapter';
  score: number; // e.g. 210
  totalMarks: number; // e.g. 300
  physicsScore?: number;
  chemistryScore?: number;
  mathsScore?: number;
  accuracyPercentage?: number;
  analysisRemarks?: string;
}

export interface DailyLog {
  dayNumber: number; // 1 to 148
  dateStr: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "23 Aug 2026, Sun"
  studyMinutes: number; // in minutes
  status: DayStatus;
  isTestDay?: boolean;
  mockTest?: MockTestDetails;
  tasks: DailyTask[];
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  waterGlasses: number; // 250ml glasses, e.g. 8-12
  notes: string;
  subjectMinutes: {
    physics: number;
    chemistry: number;
    mathematics: number;
    general: number;
  };
}

export interface UserProfileData {
  profile?: ProfileType;
  username?: string;
  name: string;
  targetDailyHours: number;
  targetPercentile?: string;
  quote?: string;
  isPublic?: boolean;
  chapters: Chapter[];
  dailyLogs: Record<number, DailyLog>; // Day 1 to 148
}

export interface MissionStats {
  totalChapters: number;
  completedChapters: number;
  overallProgress: number;
  physicsProgress: number;
  chemistryProgress: number;
  mathsProgress: number;
  totalLecturesCompleted: number;
  totalLecturesCount: number;
  totalPyqsCompleted: number;
  totalPyqsCount: number;
  totalRevisions: number;
  totalStudyMinutes: number;
  totalStudyHours: number;
  currentStreak: number;
  completedDaysCount: number;
  totalMockTests: number;
  avgMockScore?: number;
  highestMockScore?: number;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  isPublic: boolean;
  targetDailyHours: number;
  targetPercentile: string;
  quote: string;
  createdAt: string;
  privacySettings: {
    showSubjectBreakdown: boolean;
    showStreaks: boolean;
    showStudyHours: boolean;
    showDailyLogs: boolean;
  };
}

export interface PublicUserProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  quote: string;
  targetDailyHours: number;
  targetPercentile: string;
  isPublic: boolean;
  stats: MissionStats & {
    completedLectures: number;
    completedPyqs: number;
    shortNotesCount: number;
    avgDailyHours: number;
    target148Progress: number;
    currentDay: number;
  };
  subjectStats: {
    physics: { chapters: number; completedChapters: number; lectures: number; pyqs: number; progress: number };
    chemistry: { chapters: number; completedChapters: number; lectures: number; pyqs: number; progress: number };
    mathematics: { chapters: number; completedChapters: number; lectures: number; pyqs: number; progress: number };
  };
  privacySettings?: {
    showSubjectBreakdown: boolean;
    showStreaks: boolean;
    showStudyHours: boolean;
    showDailyLogs: boolean;
  };
}

export interface LeaderboardItem {
  id: string;
  rank: number;
  username: string;
  name: string;
  avatar: string;
  targetPercentile: string;
  overallProgress: number;
  totalStudyHours: number;
  currentStreak: number;
  totalPyqsCompleted: number;
  totalLecturesCompleted: number;
  totalRevisions: number;
  completedChapters: number;
  totalChapters: number;
  avgDailyHours: number;
  totalMockTests?: number;
  highestMockScore?: number;
}

