import { Chapter, DailyLog, MissionStats, SubjectType, UserProfileData } from '../types';
import { TOTAL_MISSION_DAYS } from './dateUtils';

/**
 * Calculate progress percentage for a single chapter (0 - 100)
 */
export function calculateChapterProgress(chapter: Chapter): number {
  let lectureScore = 0;
  if (chapter.lecturesTotal > 0) {
    lectureScore = Math.min(1, chapter.lecturesCompleted / chapter.lecturesTotal);
  } else if (chapter.lecturesCompleted > 0) {
    lectureScore = 1;
  }

  let pyqScore = 0;
  if (chapter.pyqsMode === 'toggle') {
    pyqScore = chapter.pyqsDone ? 1 : 0;
  } else {
    if (chapter.pyqsTotal > 0) {
      pyqScore = Math.min(1, chapter.pyqsCompleted / chapter.pyqsTotal);
    } else if (chapter.pyqsCompleted > 0) {
      pyqScore = 1;
    }
  }

  const shortNotesScore = chapter.shortNotes ? 1 : 0;

  let revisionScore = 0;
  if (chapter.revisionCount >= 2) {
    revisionScore = 1;
  } else if (chapter.revisionCount === 1) {
    revisionScore = 0.6;
  } else {
    revisionScore = 0;
  }

  // Weighted calculation:
  // Lectures: 35%, PYQs: 35%, Short Notes: 15%, Revisions: 15%
  const total = (lectureScore * 35) + (pyqScore * 35) + (shortNotesScore * 15) + (revisionScore * 15);
  return Math.min(100, Math.round(total));
}

/**
 * Check if a chapter is considered fully complete
 */
export function isChapterComplete(chapter: Chapter): boolean {
  return calculateChapterProgress(chapter) >= 90;
}

/**
 * Calculate subject-wise and overall progress stats for a user
 */
export function calculateProfileStats(profileData: UserProfileData): MissionStats {
  const chapters = profileData.chapters || [];
  const dailyLogs = profileData.dailyLogs || {};

  const physicsChapters = chapters.filter(c => c.subject === 'physics');
  const chemistryChapters = chapters.filter(c => c.subject === 'chemistry');
  const mathsChapters = chapters.filter(c => c.subject === 'mathematics');

  const calcAvgProgress = (list: Chapter[]) => {
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, c) => acc + calculateChapterProgress(c), 0);
    return Math.round(sum / list.length);
  };

  const physicsProgress = calcAvgProgress(physicsChapters);
  const chemistryProgress = calcAvgProgress(chemistryChapters);
  const mathsProgress = calcAvgProgress(mathsChapters);

  let overallProgress = 0;
  if (chapters.length > 0) {
    const sum = chapters.reduce((acc, c) => acc + calculateChapterProgress(c), 0);
    overallProgress = Math.round(sum / chapters.length);
  }

  const completedChapters = chapters.filter(c => isChapterComplete(c)).length;

  let totalLecturesCompleted = 0;
  let totalLecturesCount = 0;
  let totalPyqsCompleted = 0;
  let totalPyqsCount = 0;
  let totalRevisions = 0;

  for (const c of chapters) {
    totalLecturesCompleted += Number(c.lecturesCompleted) || 0;
    totalLecturesCount += Number(c.lecturesTotal) || 0;
    
    if (c.pyqsMode === 'toggle') {
      if (c.pyqsDone) totalPyqsCompleted += 1;
      totalPyqsCount += 1;
    } else {
      totalPyqsCompleted += Number(c.pyqsCompleted) || 0;
      totalPyqsCount += Number(c.pyqsTotal) || 0;
    }

    totalRevisions += Number(c.revisionCount) || 0;
  }

  // Daily log aggregates
  let totalStudyMinutes = 0;
  let completedDaysCount = 0;
  let totalMockTests = 0;
  let totalMockScoreSum = 0;
  let mockTestsWithScoresCount = 0;
  let highestMockScore = 0;

  const logsArray: DailyLog[] = Object.values(dailyLogs);
  for (const log of logsArray) {
    totalStudyMinutes += Number(log.studyMinutes) || 0;
    if (log.status === 'completed' || log.studyMinutes >= 300) {
      completedDaysCount += 1;
    }

    if (log.isTestDay || Boolean(log.mockTest)) {
      totalMockTests += 1;
      if (log.mockTest && typeof log.mockTest.score === 'number' && log.mockTest.score > 0) {
        totalMockScoreSum += log.mockTest.score;
        mockTestsWithScoresCount += 1;
        if (log.mockTest.score > highestMockScore) {
          highestMockScore = log.mockTest.score;
        }
      }
    }
  }

  // Calculate current streak
  let currentStreak = 0;
  // Sort by day number descending to find consecutive days with completed status or studyMinutes >= 60
  for (let d = TOTAL_MISSION_DAYS; d >= 1; d--) {
    const log = dailyLogs[d];
    if (log && (log.status === 'completed' || log.studyMinutes > 0)) {
      currentStreak++;
    } else if (log && (log.status === 'in-progress' || log.status === 'rest')) {
      // continues
    } else if (currentStreak > 0) {
      // break streak if gap encountered
      break;
    }
  }

  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const avgMockScore = mockTestsWithScoresCount > 0 
    ? Math.round(totalMockScoreSum / mockTestsWithScoresCount) 
    : undefined;

  return {
    totalChapters: chapters.length,
    completedChapters,
    overallProgress,
    physicsProgress,
    chemistryProgress,
    mathsProgress,
    totalLecturesCompleted,
    totalLecturesCount,
    totalPyqsCompleted,
    totalPyqsCount,
    totalRevisions,
    totalStudyMinutes,
    totalStudyHours,
    currentStreak,
    completedDaysCount,
    totalMockTests,
    avgMockScore,
    highestMockScore: highestMockScore > 0 ? highestMockScore : undefined,
  };
}

export const SUBJECT_INFO: Record<SubjectType, { name: string; short: string; color: string; badgeBg: string; border: string; glow: string }> = {
  physics: {
    name: 'Physics',
    short: 'PHY',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    border: 'border-sky-500/20',
    glow: 'from-sky-500/20 to-transparent',
  },
  chemistry: {
    name: 'Chemistry',
    short: 'CHEM',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/20',
    glow: 'from-emerald-500/20 to-transparent',
  },
  mathematics: {
    name: 'Mathematics',
    short: 'MATH',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/20',
    glow: 'from-amber-500/20 to-transparent',
  },
};
