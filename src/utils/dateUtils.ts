export const MISSION_START_DATE = new Date(2026, 7, 24, 0, 0, 0); // 24 Aug 2026 (Month is 0-indexed: 7 = August), Monday
export const MISSION_END_DATE = new Date(2027, 0, 18, 23, 59, 59); // 18 Jan 2027 (Day 148, Monday)
export const TARGET_EXAM_DATE = new Date(2027, 0, 19, 9, 0, 0); // 19 Jan 2027 9:00 AM (JEE Main 2027 Target)

export const TOTAL_MISSION_DAYS = 148;

/**
 * Returns date information for a specific mission day number (1 - 148)
 */
export function getDateForDay(dayNumber: number): { date: Date; dateStr: string; formattedDate: string } {
  const date = new Date(MISSION_START_DATE.getTime());
  date.setDate(date.getDate() + (dayNumber - 1));
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const formattedDate = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  });

  return { date, dateStr, formattedDate };
}

/**
 * Generates initial empty 148 days calendar
 */
export function generateInitialDays(): Record<number, { dayNumber: number; dateStr: string; formattedDate: string }> {
  const map: Record<number, { dayNumber: number; dateStr: string; formattedDate: string }> = {};
  for (let i = 1; i <= TOTAL_MISSION_DAYS; i++) {
    const { dateStr, formattedDate } = getDateForDay(i);
    map[i] = {
      dayNumber: i,
      dateStr,
      formattedDate,
    };
  }
  return map;
}

/**
 * Get current mission day number based on current system time
 */
export function getCurrentMissionDayNumber(): { currentDay: number; isBefore: boolean; isAfter: boolean; daysRemaining: number } {
  const now = new Date();
  
  // Normalized to start of day
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(MISSION_START_DATE.getFullYear(), MISSION_START_DATE.getMonth(), MISSION_START_DATE.getDate());
  const end = new Date(MISSION_END_DATE.getFullYear(), MISSION_END_DATE.getMonth(), MISSION_END_DATE.getDate());

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays < 1) {
    return { currentDay: 1, isBefore: true, isAfter: false, daysRemaining: TOTAL_MISSION_DAYS };
  } else if (diffDays > TOTAL_MISSION_DAYS) {
    return { currentDay: TOTAL_MISSION_DAYS, isBefore: false, isAfter: true, daysRemaining: 0 };
  } else {
    return { currentDay: diffDays, isBefore: false, isAfter: false, daysRemaining: Math.max(0, TOTAL_MISSION_DAYS - diffDays + 1) };
  }
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalSeconds: number;
}

export function calculateCountdown(targetDate: Date): CountdownTime {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalSeconds: 0 };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    totalSeconds: Math.floor(diff / 1000),
  };
}
