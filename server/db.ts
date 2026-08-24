import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserAccount, UserProfileData, PublicUserProfile, MissionStats, Chapter, DailyLog, SubjectType } from '../src/types';
import { calculateProfileStats } from '../src/utils/calculator';
import { generateInitialDays, TOTAL_MISSION_DAYS, getCurrentMissionDayNumber } from '../src/utils/dateUtils';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USER_DATA_FILE = path.join(DATA_DIR, 'userdata.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredUser {
  id: string;
  username: string; // unique lowercase
  email: string; // unique lowercase
  name: string;
  passwordHash: string;
  salt: string;
  avatar: string;
  targetDailyHours: number;
  targetPercentile: string;
  quote: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  privacySettings: {
    showSubjectBreakdown: boolean;
    showStreaks: boolean;
    showStudyHours: boolean;
    showDailyLogs: boolean;
  };
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

// Helpers for safe file I/O
function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJSON<T>(filePath: string, data: T): void {
  try {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Cryptography helpers
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const effectiveSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, effectiveSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: effectiveSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return check === hash;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Initializing Default Data (Nibir & Maitreyan pre-seeded for seamless compatibility)
function seedDefaultAccounts(): void {
  const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
  const userData = readJSON<Record<string, UserProfileData>>(USER_DATA_FILE, {});

  let changed = false;

  if (!users['nibir']) {
    const { hash, salt } = hashPassword('Target148@2027');
    users['nibir'] = {
      id: 'usr_nibir_148',
      username: 'nibir',
      email: 'nibir@jeemission148.com',
      name: 'Nibir',
      passwordHash: hash,
      salt: salt,
      avatar: 'amber',
      targetDailyHours: 10,
      targetPercentile: '95+ Percentile (AIR < 10,000)',
      quote: '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).',
      isPublic: true,
      createdAt: new Date('2026-08-23T00:00:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
      privacySettings: {
        showSubjectBreakdown: true,
        showStreaks: true,
        showStudyHours: true,
        showDailyLogs: false,
      },
    };

    if (!userData['usr_nibir_148']) {
      const initialDays = generateInitialDays();
      const logs: Record<number, DailyLog> = {};
      for (let i = 1; i <= TOTAL_MISSION_DAYS; i++) {
        logs[i] = {
          dayNumber: i,
          dateStr: initialDays[i].dateStr,
          formattedDate: initialDays[i].formattedDate,
          studyMinutes: 0,
          status: 'untracked',
          tasks: [],
          meals: { breakfast: false, lunch: false, dinner: false },
          waterGlasses: 0,
          notes: '',
          subjectMinutes: { physics: 0, chemistry: 0, mathematics: 0, general: 0 },
        };
      }
      userData['usr_nibir_148'] = {
        profile: 'nibir',
        name: 'Nibir',
        targetDailyHours: 10,
        quote: '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).',
        chapters: [],
        dailyLogs: logs,
      };
    }
    changed = true;
  }

  if (!users['maitreyan']) {
    const { hash, salt } = hashPassword('Target148@2027');
    users['maitreyan'] = {
      id: 'usr_maitreyan_148',
      username: 'maitreyan',
      email: 'maitreyan@jeemission148.com',
      name: 'Maitreyan',
      passwordHash: hash,
      salt: salt,
      avatar: 'blue',
      targetDailyHours: 10,
      targetPercentile: '95+ Percentile (AIR < 10,000)',
      quote: 'Consistency beats talent when talent stops working. Target: AIR < 10k.',
      isPublic: true,
      createdAt: new Date('2026-08-23T00:00:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
      privacySettings: {
        showSubjectBreakdown: true,
        showStreaks: true,
        showStudyHours: true,
        showDailyLogs: false,
      },
    };

    if (!userData['usr_maitreyan_148']) {
      const initialDays = generateInitialDays();
      const logs: Record<number, DailyLog> = {};
      for (let i = 1; i <= TOTAL_MISSION_DAYS; i++) {
        logs[i] = {
          dayNumber: i,
          dateStr: initialDays[i].dateStr,
          formattedDate: initialDays[i].formattedDate,
          studyMinutes: 0,
          status: 'untracked',
          tasks: [],
          meals: { breakfast: false, lunch: false, dinner: false },
          waterGlasses: 0,
          notes: '',
          subjectMinutes: { physics: 0, chemistry: 0, mathematics: 0, general: 0 },
        };
      }
      userData['usr_maitreyan_148'] = {
        profile: 'maitreyan',
        name: 'Maitreyan',
        targetDailyHours: 10,
        quote: 'Consistency beats talent when talent stops working. Target: AIR < 10k.',
        chapters: [],
        dailyLogs: logs,
      };
    }
    changed = true;
  }

  if (changed) {
    writeJSON(USERS_FILE, users);
    writeJSON(USER_DATA_FILE, userData);
  }
}

seedDefaultAccounts();

// Database Operations
export const db = {
  findUserByUsername(username: string): StoredUser | null {
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    const norm = username.trim().toLowerCase();
    const user = Object.values(users).find((u) => u.username.toLowerCase() === norm);
    return user || null;
  },

  findUserByEmail(email: string): StoredUser | null {
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    const norm = email.trim().toLowerCase();
    const user = Object.values(users).find((u) => u.email.toLowerCase() === norm);
    return user || null;
  },

  findUserById(id: string): StoredUser | null {
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    return users[id] || Object.values(users).find((u) => u.id === id) || null;
  },

  findUserByResetToken(token: string): StoredUser | null {
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    const now = Date.now();
    const user = Object.values(users).find((u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > now);
    return user || null;
  },

  createUser(data: {
    username: string;
    email: string;
    name: string;
    password: string;
    targetDailyHours?: number;
    targetPercentile?: string;
    quote?: string;
    isPublic?: boolean;
    initialData?: UserProfileData;
  }): { user: StoredUser; token: string } {
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    const normUsername = data.username.trim().toLowerCase();
    const normEmail = data.email.trim().toLowerCase();

    if (this.findUserByUsername(normUsername)) {
      throw new Error(`Username "@${data.username}" is already taken.`);
    }
    if (this.findUserByEmail(normEmail)) {
      throw new Error(`Email address "${data.email}" is already registered.`);
    }

    const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { hash, salt } = hashPassword(data.password);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id,
      username: normUsername,
      email: normEmail,
      name: data.name.trim() || data.username,
      passwordHash: hash,
      salt: salt,
      avatar: ['amber', 'emerald', 'blue', 'purple', 'rose', 'cyan'][Math.floor(Math.random() * 6)],
      targetDailyHours: data.targetDailyHours || 10,
      targetPercentile: data.targetPercentile || '95+ Percentile (AIR < 10,000)',
      quote: data.quote || '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).',
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      createdAt: now,
      updatedAt: now,
      privacySettings: {
        showSubjectBreakdown: true,
        showStreaks: true,
        showStudyHours: true,
        showDailyLogs: false,
      },
    };

    users[id] = newUser;
    writeJSON(USERS_FILE, users);

    // Initialize or migrate user data
    const userData = readJSON<Record<string, UserProfileData>>(USER_DATA_FILE, {});
    if (data.initialData && data.initialData.chapters) {
      userData[id] = {
        ...data.initialData,
        name: newUser.name,
        targetDailyHours: newUser.targetDailyHours,
        quote: newUser.quote,
      };
    } else {
      const initialDays = generateInitialDays();
      const logs: Record<number, DailyLog> = {};
      for (let i = 1; i <= TOTAL_MISSION_DAYS; i++) {
        logs[i] = {
          dayNumber: i,
          dateStr: initialDays[i].dateStr,
          formattedDate: initialDays[i].formattedDate,
          studyMinutes: 0,
          status: 'untracked',
          tasks: [],
          meals: { breakfast: false, lunch: false, dinner: false },
          waterGlasses: 0,
          notes: '',
          subjectMinutes: { physics: 0, chemistry: 0, mathematics: 0, general: 0 },
        };
      }
      userData[id] = {
        profile: 'nibir',
        name: newUser.name,
        targetDailyHours: newUser.targetDailyHours,
        quote: newUser.quote,
        chapters: [],
        dailyLogs: logs,
      };
    }
    writeJSON(USER_DATA_FILE, userData);

    // Create session token
    const token = this.createSession(id);
    return { user: newUser, token };
  },

  updateUser(id: string, patch: Partial<StoredUser>): StoredUser {
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    const user = users[id] || Object.values(users).find((u) => u.id === id);
    if (!user) throw new Error('User not found.');

    if (patch.username && patch.username.toLowerCase() !== user.username.toLowerCase()) {
      const existing = this.findUserByUsername(patch.username);
      if (existing && existing.id !== user.id) {
        throw new Error(`Username "@${patch.username}" is already taken.`);
      }
      user.username = patch.username.trim().toLowerCase();
    }

    if (patch.name !== undefined) user.name = patch.name.trim();
    if (patch.avatar !== undefined) user.avatar = patch.avatar;
    if (patch.targetDailyHours !== undefined) user.targetDailyHours = patch.targetDailyHours;
    if (patch.targetPercentile !== undefined) user.targetPercentile = patch.targetPercentile;
    if (patch.quote !== undefined) user.quote = patch.quote;
    if (patch.isPublic !== undefined) user.isPublic = patch.isPublic;
    if (patch.privacySettings !== undefined) {
      user.privacySettings = { ...user.privacySettings, ...patch.privacySettings };
    }
    if (patch.passwordHash !== undefined && patch.salt !== undefined) {
      user.passwordHash = patch.passwordHash;
      user.salt = patch.salt;
    }
    if (patch.resetToken !== undefined) user.resetToken = patch.resetToken;
    if (patch.resetTokenExpiry !== undefined) user.resetTokenExpiry = patch.resetTokenExpiry;

    user.updatedAt = new Date().toISOString();
    users[user.id] = user;
    writeJSON(USERS_FILE, users);
    return user;
  },

  createSession(userId: string): string {
    const sessions = readJSON<Record<string, StoredSession>>(SESSIONS_FILE, {});
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + 90 * 24 * 60 * 60 * 1000; // 90 days validity

    sessions[token] = {
      token,
      userId,
      createdAt: now,
      expiresAt,
    };
    writeJSON(SESSIONS_FILE, sessions);
    return token;
  },

  validateSession(token: string): StoredUser | null {
    if (!token) return null;
    const sessions = readJSON<Record<string, StoredSession>>(SESSIONS_FILE, {});
    const session = sessions[token];
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      delete sessions[token];
      writeJSON(SESSIONS_FILE, sessions);
      return null;
    }

    return this.findUserById(session.userId);
  },

  deleteSession(token: string): void {
    const sessions = readJSON<Record<string, StoredSession>>(SESSIONS_FILE, {});
    if (sessions[token]) {
      delete sessions[token];
      writeJSON(SESSIONS_FILE, sessions);
    }
  },

  getUserData(userId: string): UserProfileData | null {
    const userData = readJSON<Record<string, UserProfileData>>(USER_DATA_FILE, {});
    return userData[userId] || null;
  },

  saveUserData(userId: string, data: UserProfileData): void {
    const userData = readJSON<Record<string, UserProfileData>>(USER_DATA_FILE, {});
    userData[userId] = data;
    writeJSON(USER_DATA_FILE, userData);
  },

  getSanitizedAccount(user: StoredUser): UserAccount {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isPublic: user.isPublic,
      targetDailyHours: user.targetDailyHours,
      targetPercentile: user.targetPercentile,
      quote: user.quote,
      createdAt: user.createdAt,
      privacySettings: user.privacySettings,
    };
  },

  calculateUserStats(userId: string): { stats: MissionStats; subjectStats: any } {
    const data = this.getUserData(userId);
    const chapters = data?.chapters || [];
    const logs = data?.dailyLogs || {};

    const stats = calculateProfileStats(data || {
      profile: 'nibir',
      name: '',
      targetDailyHours: 10,
      quote: '',
      chapters,
      dailyLogs: logs,
    });

    const getSubjectData = (subj: SubjectType) => {
      const subjChaps = chapters.filter((c) => c.subject === subj);
      const completed = subjChaps.filter((c) => {
        const lectDone = c.lecturesTotal > 0 && c.lecturesCompleted >= c.lecturesTotal;
        const pyqDone = c.pyqsMode === 'toggle' ? c.pyqsDone : c.pyqsTotal > 0 && c.pyqsCompleted >= c.pyqsTotal;
        return lectDone && pyqDone && c.shortNotes;
      }).length;

      const lects = subjChaps.reduce((acc, c) => acc + (c.lecturesCompleted || 0), 0);
      const pyqs = subjChaps.reduce((acc, c) => acc + (c.pyqsMode === 'toggle' ? (c.pyqsDone ? 100 : 0) : c.pyqsCompleted || 0), 0);
      const progress = subjChaps.length > 0 ? Math.round((completed / subjChaps.length) * 100) : 0;

      return {
        chapters: subjChaps.length,
        completedChapters: completed,
        lectures: lects,
        pyqs,
        progress,
      };
    };

    return {
      stats,
      subjectStats: {
        physics: getSubjectData('physics'),
        chemistry: getSubjectData('chemistry'),
        mathematics: getSubjectData('mathematics'),
      },
    };
  },

  getPublicUserProfile(username: string): PublicUserProfile | null {
    const user = this.findUserByUsername(username);
    if (!user || !user.isPublic) return null;

    const { stats, subjectStats } = this.calculateUserStats(user.id);
    const { currentDay } = getCurrentMissionDayNumber();
    const completedDays = stats.completedDaysCount || 1;
    const avgDailyHours = Math.round((stats.totalStudyHours / Math.max(1, completedDays)) * 10) / 10;

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      quote: user.quote,
      targetDailyHours: user.targetDailyHours,
      targetPercentile: user.targetPercentile,
      isPublic: true,
      stats: {
        ...stats,
        completedLectures: stats.totalLecturesCompleted,
        completedPyqs: stats.totalPyqsCompleted,
        shortNotesCount: (this.getUserData(user.id)?.chapters || []).filter((c) => c.shortNotes).length,
        avgDailyHours,
        target148Progress: stats.overallProgress,
        currentDay,
      },
      subjectStats,
      privacySettings: user.privacySettings,
    };
  },

  getPublicLeaderboard(sortBy: 'progress' | 'hours' | 'pyqs' | 'lectures' | 'streak' = 'progress') {
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    const publicUsers = Object.values(users).filter((u) => u.isPublic);

    const items = publicUsers.map((user) => {
      const { stats } = this.calculateUserStats(user.id);
      const completedDays = stats.completedDaysCount || 1;
      const avgDailyHours = Math.round((stats.totalStudyHours / Math.max(1, completedDays)) * 10) / 10;

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        targetPercentile: user.targetPercentile,
        overallProgress: stats.overallProgress,
        totalStudyHours: stats.totalStudyHours,
        currentStreak: stats.currentStreak,
        totalPyqsCompleted: stats.totalPyqsCompleted,
        totalLecturesCompleted: stats.totalLecturesCompleted,
        totalRevisions: stats.totalRevisions,
        completedChapters: stats.completedChapters,
        totalChapters: stats.totalChapters,
        avgDailyHours,
        totalMockTests: stats.totalMockTests || 0,
        highestMockScore: stats.highestMockScore || 0,
      };
    });

    // Sort by requested metric
    items.sort((a, b) => {
      switch (sortBy) {
        case 'hours':
          return b.totalStudyHours - a.totalStudyHours || b.overallProgress - a.overallProgress;
        case 'pyqs':
          return b.totalPyqsCompleted - a.totalPyqsCompleted || b.overallProgress - a.overallProgress;
        case 'lectures':
          return b.totalLecturesCompleted - a.totalLecturesCompleted || b.overallProgress - a.overallProgress;
        case 'streak':
          return b.currentStreak - a.currentStreak || b.overallProgress - a.overallProgress;
        case 'progress':
        default:
          return b.overallProgress - a.overallProgress || b.totalStudyHours - a.totalStudyHours;
      }
    });

    return items.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  },

  searchPublicUsers(query: string) {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    const users = readJSON<Record<string, StoredUser>>(USERS_FILE, {});
    const matched = Object.values(users).filter(
      (u) => u.isPublic && (u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
    );

    return matched.slice(0, 10).map((user) => {
      const { stats } = this.calculateUserStats(user.id);
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        targetPercentile: user.targetPercentile,
        overallProgress: stats.overallProgress,
        totalStudyHours: stats.totalStudyHours,
        currentStreak: stats.currentStreak,
        totalChapters: stats.totalChapters,
        completedChapters: stats.completedChapters,
      };
    });
  },
};
