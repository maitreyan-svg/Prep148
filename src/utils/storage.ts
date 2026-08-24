import { DailyLog, UserProfileData } from '../types';
import { getDateForDay, TOTAL_MISSION_DAYS } from './dateUtils';

const STORAGE_KEY_PREFIX = 'jee_mission_148_v2_';
const GUEST_STORAGE_KEY = `${STORAGE_KEY_PREFIX}my_profile`;

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

export function createInitialProfile(username?: string, name?: string): UserProfileData {
  const effectiveUsername = username || 'aspirant';
  const effectiveName = name || (username ? username.charAt(0).toUpperCase() + username.slice(1) : 'My JEE Mission');
  return {
    profile: effectiveUsername,
    username: effectiveUsername,
    name: effectiveName,
    targetDailyHours: 10,
    targetPercentile: '95+ Percentile (AIR < 10,000)',
    quote: '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).',
    isPublic: true,
    chapters: [], // Clean syllabus tracker
    dailyLogs: createEmptyDailyLogs(),
  };
}

export function loadProfileData(profileId = 'my_profile'): UserProfileData {
  try {
    const key = profileId === 'my_profile' ? GUEST_STORAGE_KEY : `${STORAGE_KEY_PREFIX}${profileId}`;
    const raw = localStorage.getItem(key);
    
    // Also check legacy storage key if migrating
    if (!raw && profileId === 'my_profile') {
      const legacyRaw = localStorage.getItem('jee_mission_148_v1_nibir') || localStorage.getItem('jee_mission_148_v1_my_profile');
      if (legacyRaw) {
        try {
          const legacyParsed = JSON.parse(legacyRaw) as UserProfileData;
          saveProfileData(legacyParsed, 'my_profile');
          return legacyParsed;
        } catch (_) {}
      }
    }

    if (!raw) {
      const initial = createInitialProfile(profileId, profileId === 'my_profile' ? 'My Mission' : profileId);
      saveProfileData(initial, profileId);
      return initial;
    }

    const parsed = JSON.parse(raw) as UserProfileData;
    
    // Ensure all 148 dailyLogs exist and sync formatted dates (Day 1: 24 Aug 2026)
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

    if (!parsed.quote || parsed.quote === '148 Days. 1 Goal. AIR Under 100.') {
      parsed.quote = '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).';
      saveProfileData(parsed, profileId);
    }

    return parsed;
  } catch (err) {
    console.error(`Failed to load profile ${profileId}:`, err);
    return createInitialProfile(profileId);
  }
}

export function saveProfileData(data: UserProfileData, profileId = 'my_profile'): void {
  try {
    const key = profileId === 'my_profile' ? GUEST_STORAGE_KEY : `${STORAGE_KEY_PREFIX}${profileId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save profile:`, err);
  }
}

export function exportAllData(currentData?: UserProfileData): string {
  const data = currentData || loadProfileData('my_profile');
  const payload = {
    appName: 'JEE Mission 148',
    exportedAt: new Date().toISOString(),
    version: '2.0',
    profile: data,
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllData(jsonString: string): UserProfileData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && (parsed.profile || parsed.profiles)) {
      const dataToSave = parsed.profile || parsed.profiles?.nibir || Object.values(parsed.profiles)[0];
      if (dataToSave) {
        saveProfileData(dataToSave, 'my_profile');
        return dataToSave;
      }
    }
    return null;
  } catch (err) {
    console.error('Import failed:', err);
    return null;
  }
}
