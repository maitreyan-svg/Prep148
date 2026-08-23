import { DailyLog, ProfileType, UserProfileData } from '../types';
import { getDateForDay, TOTAL_MISSION_DAYS } from './dateUtils';

const STORAGE_KEY_PREFIX = 'jee_mission_148_v1_';

export function createEmptyDailyLogs(): Record<number, DailyLog> {
  const logs: Record<number, DailyLog> = {};
  for (let i = 1; i <= TOTAL_MISSION_DAYS; i++) {
    const { dateStr, formattedDate } = getDateForDay(i);
    logs[i] = {
      dayNumber: i,
      dateStr,
      formattedDate,
      studyMinutes: 0,
      status: 'untracked',
      tasks: [],
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false,
      },
      waterGlasses: 0,
      notes: '',
      subjectMinutes: {
        physics: 0,
        chemistry: 0,
        mathematics: 0,
        general: 0,
      },
    };
  }
  return logs;
}

export function createInitialProfile(profile: ProfileType): UserProfileData {
  return {
    profile,
    name: profile === 'nibir' ? 'Nibir' : 'Maitreyan',
    targetDailyHours: 10,
    quote: profile === 'nibir' ? '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).' : 'Consistency beats talent when talent stops working. Target: AIR < 10k.',
    chapters: [], // Completely empty as requested!
    dailyLogs: createEmptyDailyLogs(),
  };
}

export function loadProfileData(profile: ProfileType): UserProfileData {
  try {
    const key = `${STORAGE_KEY_PREFIX}${profile}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = createInitialProfile(profile);
      saveProfileData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as UserProfileData;
    
    // Ensure all 148 dailyLogs exist and sync formatted dates
    const emptyLogs = createEmptyDailyLogs();
    parsed.dailyLogs = { ...emptyLogs, ...(parsed.dailyLogs || {}) };

    for (let i = 1; i <= TOTAL_MISSION_DAYS; i++) {
      const { dateStr, formattedDate } = getDateForDay(i);
      if (parsed.dailyLogs[i]) {
        parsed.dailyLogs[i].dateStr = dateStr;
        parsed.dailyLogs[i].formattedDate = formattedDate;
      }
    }
    
    if (!Array.isArray(parsed.chapters)) {
      parsed.chapters = [];
    }

    // Auto-update quote if using the previous default AIR 100 quote
    if (parsed.quote === '148 Days. 1 Goal. AIR Under 100.') {
      parsed.quote = '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).';
      saveProfileData(parsed);
    }

    return parsed;
  } catch (err) {
    console.error(`Failed to load profile ${profile}:`, err);
    return createInitialProfile(profile);
  }
}

export function saveProfileData(data: UserProfileData): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${data.profile}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save profile ${data.profile}:`, err);
  }
}

export function exportAllData(): string {
  const nibir = loadProfileData('nibir');
  const maitreyan = loadProfileData('maitreyan');
  const payload = {
    appName: 'Nibir Maitreyan — JEE Mission 148',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    profiles: {
      nibir,
      maitreyan,
    },
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.profiles) {
      if (parsed.profiles.nibir) {
        saveProfileData(parsed.profiles.nibir);
      }
      if (parsed.profiles.maitreyan) {
        saveProfileData(parsed.profiles.maitreyan);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}

export function resetProfileData(profile: ProfileType): UserProfileData {
  const initial = createInitialProfile(profile);
  saveProfileData(initial);
  return initial;
}
