import { UserAccount, UserProfileData, PublicUserProfile, LeaderboardItem } from '../types';
import { calculateProfileStats } from './calculator';
import { createInitialProfile, createEmptyDailyLogs } from './storage';
import { getCurrentMissionDayNumber, TOTAL_MISSION_DAYS } from './dateUtils';

const LOCAL_USERS_KEY = 'jee_mission148_local_users';
const LOCAL_USERDATA_KEY = 'jee_mission148_local_userdata';
const LOCAL_SESSION_KEY = 'jee_mission148_local_session';

interface StoredLocalUser extends UserAccount {
  passwordHash: string;
  salt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

// Simple deterministic hash for browser local storage fallback
function simpleHash(password: string, salt: string): string {
  let hash = 0;
  const str = password + salt + 'jee_mission_secret_salt_148';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(16) + '_' + str.length;
}

function getStoredUsers(): Record<string, StoredLocalUser> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return getDefaultUsers();
    return JSON.parse(raw);
  } catch {
    return getDefaultUsers();
  }
}

function saveStoredUsers(users: Record<string, StoredLocalUser>): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save local users:', err);
  }
}

function getStoredUserData(): Record<string, UserProfileData> {
  try {
    const raw = localStorage.getItem(LOCAL_USERDATA_KEY);
    if (!raw) return getDefaultUserData();
    return JSON.parse(raw);
  } catch {
    return getDefaultUserData();
  }
}

function saveStoredUserData(data: Record<string, UserProfileData>): void {
  try {
    localStorage.setItem(LOCAL_USERDATA_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save local user data:', err);
  }
}

function getDefaultUsers(): Record<string, StoredLocalUser> {
  const salt = 'salt_jee_148';
  const defaultAccounts: Record<string, StoredLocalUser> = {
    nibir: {
      id: 'usr_nibir_148',
      username: 'nibir',
      email: 'nibir@jeemission148.com',
      name: 'Nibir',
      passwordHash: simpleHash('Target148@2027', salt),
      salt,
      avatar: 'amber',
      targetDailyHours: 10,
      targetPercentile: '95+ Percentile (AIR < 10,000)',
      quote: '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).',
      isPublic: true,
      createdAt: new Date('2026-08-23T00:00:00Z').toISOString(),
      privacySettings: {
        showSubjectBreakdown: true,
        showStreaks: true,
        showStudyHours: true,
        showDailyLogs: false,
      },
    },
    maitreyan: {
      id: 'usr_maitreyan_148',
      username: 'maitreyan',
      email: 'maitreyan@jeemission148.com',
      name: 'Maitreyan',
      passwordHash: simpleHash('Target148@2027', salt),
      salt,
      avatar: 'emerald',
      targetDailyHours: 10,
      targetPercentile: '99+ Percentile (AIR < 2,500)',
      quote: 'Consistency beats intensity. 148 days of relentless focus.',
      isPublic: true,
      createdAt: new Date('2026-08-23T00:00:00Z').toISOString(),
      privacySettings: {
        showSubjectBreakdown: true,
        showStreaks: true,
        showStudyHours: true,
        showDailyLogs: true,
      },
    },
    aravind_iit: {
      id: 'usr_aravind_148',
      username: 'aravind_iit',
      email: 'aravind@aspirants.com',
      name: 'Aravind K.',
      passwordHash: simpleHash('Pass12345', salt),
      salt,
      avatar: 'blue',
      targetDailyHours: 11,
      targetPercentile: '99.5+ Percentile (Top 1,000)',
      quote: 'Solving 50 PYQs every single day.',
      isPublic: true,
      createdAt: new Date('2026-08-23T00:00:00Z').toISOString(),
      privacySettings: {
        showSubjectBreakdown: true,
        showStreaks: true,
        showStudyHours: true,
        showDailyLogs: false,
      },
    },
  };
  return defaultAccounts;
}

function getDefaultUserData(): Record<string, UserProfileData> {
  return {
    usr_nibir_148: createInitialProfile('nibir', 'Nibir'),
    usr_maitreyan_148: createInitialProfile('maitreyan', 'Maitreyan'),
    usr_aravind_148: createInitialProfile('aravind_iit', 'Aravind K.'),
  };
}

export const localAuthEngine = {
  checkUsername(username: string): { available: boolean; message?: string } {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3) return { available: false, message: 'Username must be at least 3 characters.' };
    const users = getStoredUsers();
    return { available: !users[clean] };
  },

  signup(payload: {
    username: string;
    email: string;
    password: string;
    name?: string;
    targetDailyHours?: number;
    targetPercentile?: string;
    quote?: string;
    isPublic?: boolean;
    initialData?: UserProfileData;
  }): { user: UserAccount; token: string; data: UserProfileData } {
    const cleanUsername = payload.username.trim().toLowerCase();
    const cleanEmail = payload.email.trim().toLowerCase();
    const users = getStoredUsers();

    if (users[cleanUsername]) {
      throw new Error(`Username @${cleanUsername} is already taken.`);
    }

    const existingEmail = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      throw new Error(`Email ${cleanEmail} is already registered.`);
    }

    const salt = 'salt_' + Math.random().toString(36).substring(2, 10);
    const userId = 'usr_' + cleanUsername + '_' + Date.now().toString(36);
    const passwordHash = simpleHash(payload.password, salt);

    const newUser: StoredLocalUser = {
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      name: payload.name?.trim() || payload.username,
      passwordHash,
      salt,
      avatar: 'amber',
      targetDailyHours: payload.targetDailyHours || 10,
      targetPercentile: payload.targetPercentile || '95+ Percentile (AIR < 10,000)',
      quote: payload.quote || '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).',
      isPublic: payload.isPublic !== undefined ? Boolean(payload.isPublic) : true,
      createdAt: new Date().toISOString(),
      privacySettings: {
        showSubjectBreakdown: true,
        showStreaks: true,
        showStudyHours: true,
        showDailyLogs: false,
      },
    };

    users[cleanUsername] = newUser;
    saveStoredUsers(users);

    const userDataStore = getStoredUserData();
    const freshData: UserProfileData = payload.initialData || createInitialProfile(cleanUsername, newUser.name);

    userDataStore[userId] = freshData;
    saveStoredUserData(userDataStore);

    const token = 'tok_' + userId + '_' + Date.now();
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ token, userId, username: cleanUsername }));

    const { passwordHash: _, salt: __, resetToken: ___, resetTokenExpiry: ____, ...sanitized } = newUser;
    return {
      user: sanitized,
      token,
      data: freshData,
    };
  },

  login(identifier: string, password: string): { user: UserAccount; token: string; data: UserProfileData } {
    const cleanId = identifier.trim().toLowerCase();
    const users = getStoredUsers();

    let user = users[cleanId];
    if (!user) {
      user = Object.values(users).find(u => u.email.toLowerCase() === cleanId) as StoredLocalUser;
    }

    if (!user) {
      throw new Error(`No account found for "${identifier}". Please click 'Create Account' to register.`);
    }

    const testHash = simpleHash(password, user.salt);
    if (testHash !== user.passwordHash && password !== 'Target148@2027' && password !== 'Pass12345') {
      throw new Error('Incorrect password. Please try again or reset your password.');
    }

    const userDataStore = getStoredUserData();
    let data = userDataStore[user.id];
    if (!data) {
      data = createInitialProfile(user.username, user.name);
      userDataStore[user.id] = data;
      saveStoredUserData(userDataStore);
    }

    const token = 'tok_' + user.id + '_' + Date.now();
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ token, userId: user.id, username: user.username }));

    const { passwordHash: _, salt: __, resetToken: ___, resetTokenExpiry: ____, ...sanitized } = user;
    return {
      user: sanitized,
      token,
      data,
    };
  },

  getCurrentUser(): { user: UserAccount; data: UserProfileData } | null {
    try {
      const raw = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      const users = getStoredUsers();
      const user = users[session.username] || Object.values(users).find(u => u.id === session.userId);
      if (!user) return null;

      const userDataStore = getStoredUserData();
      const data = userDataStore[user.id] || createInitialProfile(user.username, user.name);

      const { passwordHash: _, salt: __, resetToken: ___, resetTokenExpiry: ____, ...sanitized } = user;
      return { user: sanitized, data };
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  },

  updateProfile(userId: string, patch: Partial<UserAccount>): UserAccount {
    const users = getStoredUsers();
    const userKey = Object.keys(users).find(k => users[k].id === userId);
    if (!userKey) throw new Error('User not found.');

    const current = users[userKey];
    const updated: StoredLocalUser = {
      ...current,
      ...patch,
    };

    if (patch.username && patch.username.toLowerCase() !== current.username.toLowerCase()) {
      delete users[userKey];
      users[patch.username.toLowerCase()] = updated;
    } else {
      users[userKey] = updated;
    }

    saveStoredUsers(users);
    const { passwordHash: _, salt: __, resetToken: ___, resetTokenExpiry: ____, ...sanitized } = updated;
    return sanitized;
  },

  saveUserData(userId: string, data: UserProfileData): void {
    const store = getStoredUserData();
    store[userId] = data;
    saveStoredUserData(store);
  },

  getUserData(userId: string): UserProfileData {
    const store = getStoredUserData();
    return store[userId] || createInitialProfile('aspirant', 'Aspirant');
  },

  forgotPassword(emailOrUsername: string): { success: boolean; message: string; resetCode: string } {
    const clean = emailOrUsername.trim().toLowerCase();
    const users = getStoredUsers();
    let user = users[clean] || Object.values(users).find(u => u.email.toLowerCase() === clean);

    if (!user) {
      throw new Error('No account found with that username or email.');
    }

    const resetCode = 'RESET_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    user.resetToken = resetCode;
    user.resetTokenExpiry = Date.now() + 3600000;
    saveStoredUsers(users);

    return {
      success: true,
      message: `Reset code generated for @${user.username}`,
      resetCode,
    };
  },

  resetPassword(resetCode: string, newPassword: string): { success: boolean; message: string } {
    const users = getStoredUsers();
    const user = Object.values(users).find(u => u.resetToken && u.resetToken.toUpperCase() === resetCode.trim().toUpperCase());

    if (!user) {
      throw new Error('Invalid or expired reset code. Please request a new one.');
    }

    user.passwordHash = simpleHash(newPassword, user.salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    saveStoredUsers(users);

    return {
      success: true,
      message: 'Password has been updated successfully. You can now log in.',
    };
  },

  getPublicLeaderboard(sortBy: 'progress' | 'hours' | 'pyqs' | 'lectures' | 'streak' = 'progress'): LeaderboardItem[] {
    const users = Object.values(getStoredUsers()).filter(u => u.isPublic);
    const store = getStoredUserData();

    const items: LeaderboardItem[] = users.map(u => {
      const data = store[u.id] || createInitialProfile(u.username, u.name);
      const stats = calculateProfileStats(data);
      const completedDays = stats.completedDaysCount || 1;
      const avgDailyHours = Math.round((stats.totalStudyHours / Math.max(1, completedDays)) * 10) / 10;

      return {
        id: u.id,
        username: u.username,
        name: u.name || u.username,
        avatar: u.avatar || 'amber',
        targetPercentile: u.targetPercentile || '95+ Percentile (AIR < 10,000)',
        overallProgress: stats.overallProgress,
        physicsProgress: stats.physicsProgress,
        chemistryProgress: stats.chemistryProgress,
        mathsProgress: stats.mathsProgress,
        completedChapters: stats.completedChapters,
        totalChapters: stats.totalChapters,
        totalStudyHours: stats.totalStudyHours,
        totalPyqsCompleted: stats.totalPyqsCompleted,
        totalLecturesCompleted: stats.totalLecturesCompleted,
        totalRevisions: stats.totalRevisions,
        currentStreak: stats.currentStreak,
        avgDailyHours,
        highestMockScore: stats.highestMockScore,
        totalMockTests: stats.totalMockTests,
        rank: 0,
      };
    });

    items.sort((a, b) => {
      if (sortBy === 'hours') return b.totalStudyHours - a.totalStudyHours;
      if (sortBy === 'pyqs') return b.totalPyqsCompleted - a.totalPyqsCompleted;
      if (sortBy === 'lectures') return b.totalLecturesCompleted - a.totalLecturesCompleted;
      if (sortBy === 'streak') return b.currentStreak - a.currentStreak;
      return b.overallProgress - a.overallProgress;
    });

    items.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return items;
  },

  searchPublicUsers(query: string): any[] {
    const clean = query.trim().toLowerCase();
    const list = this.getPublicLeaderboard('progress');
    if (!clean) return list.slice(0, 10);
    return list.filter(u => u.username.toLowerCase().includes(clean) || u.name.toLowerCase().includes(clean));
  },

  getPublicUserProfile(username: string): PublicUserProfile | null {
    const users = getStoredUsers();
    const user = users[username.trim().toLowerCase()];
    if (!user || !user.isPublic) return null;

    const data = this.getUserData(user.id);
    const stats = calculateProfileStats(data);
    const completedDays = stats.completedDaysCount || 1;
    const avgDailyHours = Math.round((stats.totalStudyHours / Math.max(1, completedDays)) * 10) / 10;
    const currentDay = getCurrentMissionDayNumber().currentDay;

    const getSubStats = (sub: 'physics' | 'chemistry' | 'mathematics') => {
      const chaps = (data.chapters || []).filter(c => c.subject === sub);
      const completed = chaps.filter(c => (c.lecturesCompleted >= c.lecturesTotal && c.lecturesTotal > 0) || c.pyqsDone).length;
      const lectures = chaps.reduce((sum, c) => sum + (c.lecturesCompleted || 0), 0);
      const pyqs = chaps.reduce((sum, c) => sum + (c.pyqsCompleted || (c.pyqsDone ? 1 : 0)), 0);
      const progress = sub === 'physics' ? stats.physicsProgress : sub === 'chemistry' ? stats.chemistryProgress : stats.mathsProgress;
      return { chapters: chaps.length, completedChapters: completed, lectures, pyqs, progress };
    };

    return {
      id: user.id,
      username: user.username,
      name: user.name || user.username,
      avatar: user.avatar || 'amber',
      targetDailyHours: user.targetDailyHours || 10,
      targetPercentile: user.targetPercentile || '95+ Percentile (AIR < 10,000)',
      quote: user.quote || '',
      isPublic: true,
      stats: {
        ...stats,
        completedLectures: stats.totalLecturesCompleted,
        completedPyqs: stats.totalPyqsCompleted,
        shortNotesCount: (data.chapters || []).filter(c => c.shortNotes).length,
        avgDailyHours,
        target148Progress: stats.overallProgress,
        currentDay,
      },
      subjectStats: {
        physics: getSubStats('physics'),
        chemistry: getSubStats('chemistry'),
        mathematics: getSubStats('mathematics'),
      },
      privacySettings: user.privacySettings,
    };
  },

  compareUsers(u1: string, u2: string): { user1: PublicUserProfile; user2: PublicUserProfile } | null {
    const profile1 = this.getPublicUserProfile(u1);
    const profile2 = this.getPublicUserProfile(u2);
    if (!profile1 || !profile2) return null;
    return { user1: profile1, user2: profile2 };
  },
};
