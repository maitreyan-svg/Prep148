import { UserAccount, UserProfileData, PublicUserProfile, LeaderboardItem } from '../types';

const TOKEN_KEY = 'jee_mission148_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  getToken: authStorage.getToken,
  // Auth
  async checkUsername(username: string): Promise<{ available: boolean; message?: string }> {
    return fetchWithAuth(`/api/auth/check-username?u=${encodeURIComponent(username)}`);
  },

  async signup(payload: {
    username: string;
    email: string;
    password: string;
    name?: string;
    targetDailyHours?: number;
    targetPercentile?: string;
    quote?: string;
    isPublic?: boolean;
    initialData?: UserProfileData;
  }): Promise<{ user: UserAccount; token: string; data: UserProfileData }> {
    const res = await fetchWithAuth('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      authStorage.setToken(res.token);
    }
    return res;
  },

  async login(identifier: string, password: string): Promise<{ user: UserAccount; token: string; data: UserProfileData }> {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.token) {
      authStorage.setToken(res.token);
    }
    return res;
  },

  async getCurrentUser(): Promise<{ user: UserAccount; data: UserProfileData } | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      return await fetchWithAuth('/api/auth/me');
    } catch (err) {
      authStorage.removeToken();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      authStorage.removeToken();
    }
  },

  async forgotPassword(emailOrUsername: string): Promise<{ success: boolean; message: string; resetCode?: string; instructions?: string }> {
    return fetchWithAuth('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername }),
    });
  },

  async resetPassword(resetCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetCode, newPassword }),
    });
  },

  // User Profile & Settings
  async updateProfile(patch: Partial<UserAccount>): Promise<{ user: UserAccount; message: string }> {
    return fetchWithAuth('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  },

  async updateSettings(payload: {
    isPublic?: boolean;
    privacySettings?: UserAccount['privacySettings'];
  }): Promise<{ user: UserAccount; message: string }> {
    return fetchWithAuth('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth('/api/user/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Target 148 Data Cloud Sync
  async syncUserData(data: UserProfileData): Promise<{ success: boolean; message: string; timestamp: string }> {
    return fetchWithAuth('/api/user/data', {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  async getUserData(): Promise<{ data: UserProfileData }> {
    return fetchWithAuth('/api/user/data');
  },

  // Public Community
  async searchPublicUsers(query: string): Promise<{ results: any[] }> {
    return fetchWithAuth(`/api/public/search?q=${encodeURIComponent(query)}`);
  },

  async getPublicProfile(username: string): Promise<{ profile: PublicUserProfile }> {
    return fetchWithAuth(`/api/public/user/${encodeURIComponent(username)}`);
  },

  async getLeaderboard(sortBy: 'progress' | 'hours' | 'pyqs' | 'lectures' | 'streak' = 'progress'): Promise<{ leaderboard: LeaderboardItem[] }> {
    return fetchWithAuth(`/api/public/leaderboard?sortBy=${sortBy}`);
  },

  async comparePublicUsers(u1: string, u2: string): Promise<{ user1: PublicUserProfile; user2: PublicUserProfile }> {
    return fetchWithAuth(`/api/public/compare?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`);
  },
};
