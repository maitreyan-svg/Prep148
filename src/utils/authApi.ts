import { UserAccount, UserProfileData, PublicUserProfile, LeaderboardItem } from '../types';
import { localAuthEngine } from './localAuthEngine';

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

  // If server returns HTML (like 404 from Vite SPA fallback)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Server returned non-JSON response (${response.status})`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  getToken: authStorage.getToken,

  // Check username
  async checkUsername(username: string): Promise<{ available: boolean; message?: string }> {
    try {
      return await fetchWithAuth(`/api/auth/check-username?u=${encodeURIComponent(username)}`);
    } catch {
      return localAuthEngine.checkUsername(username);
    }
  },

  // Sign up / Create Account
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
    // Always persist to localAuthEngine first to guarantee local resilience
    let localRes: { user: UserAccount; token: string; data: UserProfileData } | null = null;
    try {
      localRes = localAuthEngine.signup(payload);
    } catch (localErr: any) {
      // If error is already taken in local, throw clean message
      throw localErr;
    }

    try {
      const serverRes = await fetchWithAuth('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (serverRes.token) {
        authStorage.setToken(serverRes.token);
      }
      return serverRes;
    } catch (err: any) {
      console.warn('Backend server unavailable or returned error, relying on local auth:', err.message);
      if (localRes) {
        authStorage.setToken(localRes.token);
        return localRes;
      }
      throw err;
    }
  },

  // Sign in / Login
  async login(identifier: string, password: string): Promise<{ user: UserAccount; token: string; data: UserProfileData }> {
    try {
      const res = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      if (res.token) {
        authStorage.setToken(res.token);
      }
      // Sync local engine copy as well
      try {
        localAuthEngine.saveUserData(res.user.id, res.data);
      } catch {}
      return res;
    } catch (serverErr: any) {
      // Fall back to local account authentication seamlessly
      try {
        const localRes = localAuthEngine.login(identifier, password);
        if (localRes.token) {
          authStorage.setToken(localRes.token);
        }
        return localRes;
      } catch (localErr: any) {
        // If neither worked, provide clear error message
        if (localErr.message && !localErr.message.includes('404')) {
          throw localErr;
        }
        throw new Error(serverErr.message || 'Login failed. Please check your username and password.');
      }
    }
  },

  // Get current active session
  async getCurrentUser(): Promise<{ user: UserAccount; data: UserProfileData } | null> {
    const token = authStorage.getToken();
    if (!token) {
      return localAuthEngine.getCurrentUser();
    }
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (res && res.user) {
        try { localAuthEngine.saveUserData(res.user.id, res.data); } catch {}
        return res;
      }
      return localAuthEngine.getCurrentUser();
    } catch {
      return localAuthEngine.getCurrentUser();
    }
  },

  // Log out
  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch {}
    localAuthEngine.logout();
    authStorage.removeToken();
  },

  // Forgot password
  async forgotPassword(emailOrUsername: string): Promise<{ success: boolean; message: string; resetCode?: string; instructions?: string }> {
    try {
      return await fetchWithAuth('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername }),
      });
    } catch {
      const res = localAuthEngine.forgotPassword(emailOrUsername);
      return {
        success: true,
        message: res.message,
        resetCode: res.resetCode,
        instructions: `Enter reset code "${res.resetCode}" along with your new password.`,
      };
    }
  },

  // Reset password
  async resetPassword(resetCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      return await fetchWithAuth('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetCode, newPassword }),
      });
    } catch {
      return localAuthEngine.resetPassword(resetCode, newPassword);
    }
  },

  // User Profile & Settings
  async updateProfile(patch: Partial<UserAccount>): Promise<{ user: UserAccount; message: string }> {
    try {
      const res = await fetchWithAuth('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      if (res.user) {
        try { localAuthEngine.updateProfile(res.user.id, patch); } catch {}
      }
      return res;
    } catch {
      const cur = localAuthEngine.getCurrentUser();
      if (!cur) throw new Error('Not signed in.');
      const updated = localAuthEngine.updateProfile(cur.user.id, patch);
      return { user: updated, message: 'Profile updated successfully.' };
    }
  },

  async updateSettings(payload: {
    isPublic?: boolean;
    privacySettings?: UserAccount['privacySettings'];
  }): Promise<{ user: UserAccount; message: string }> {
    try {
      return await fetchWithAuth('/api/user/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      const cur = localAuthEngine.getCurrentUser();
      if (!cur) throw new Error('Not signed in.');
      const updated = localAuthEngine.updateProfile(cur.user.id, {
        isPublic: payload.isPublic,
        privacySettings: payload.privacySettings,
      });
      return { user: updated, message: 'Privacy preferences updated.' };
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      return await fetchWithAuth('/api/user/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch {
      const cur = localAuthEngine.getCurrentUser();
      if (!cur) throw new Error('Not signed in.');
      // Verify and change
      const loginCheck = localAuthEngine.login(cur.user.username, currentPassword);
      if (!loginCheck) throw new Error('Current password is not correct.');
      localAuthEngine.resetPassword(cur.user.username, newPassword);
      return { success: true, message: 'Password changed successfully.' };
    }
  },

  // Target 148 Data Cloud Sync
  async syncUserData(data: UserProfileData): Promise<{ success: boolean; message: string; timestamp: string }> {
    const cur = localAuthEngine.getCurrentUser();
    if (cur) {
      localAuthEngine.saveUserData(cur.user.id, data);
    }

    try {
      return await fetchWithAuth('/api/user/data', {
        method: 'PUT',
        body: JSON.stringify({ data }),
      });
    } catch {
      return {
        success: true,
        message: 'Saved locally and synced to session storage.',
        timestamp: new Date().toISOString(),
      };
    }
  },

  async getUserData(): Promise<{ data: UserProfileData }> {
    try {
      return await fetchWithAuth('/api/user/data');
    } catch {
      const cur = localAuthEngine.getCurrentUser();
      if (cur) {
        return { data: cur.data };
      }
      throw new Error('No user data available.');
    }
  },

  // Public Community
  async searchPublicUsers(query: string): Promise<{ results: any[] }> {
    try {
      return await fetchWithAuth(`/api/public/search?q=${encodeURIComponent(query)}`);
    } catch {
      return { results: localAuthEngine.searchPublicUsers(query) };
    }
  },

  async getPublicProfile(username: string): Promise<{ profile: PublicUserProfile }> {
    try {
      return await fetchWithAuth(`/api/public/user/${encodeURIComponent(username)}`);
    } catch {
      const profile = localAuthEngine.getPublicUserProfile(username);
      if (!profile) throw new Error(`User @${username} not found.`);
      return { profile };
    }
  },

  async getLeaderboard(sortBy: 'progress' | 'hours' | 'pyqs' | 'lectures' | 'streak' = 'progress'): Promise<{ leaderboard: LeaderboardItem[] }> {
    try {
      return await fetchWithAuth(`/api/public/leaderboard?sortBy=${sortBy}`);
    } catch {
      return { leaderboard: localAuthEngine.getPublicLeaderboard(sortBy) };
    }
  },

  async comparePublicUsers(u1: string, u2: string): Promise<{ user1: PublicUserProfile; user2: PublicUserProfile }> {
    try {
      return await fetchWithAuth(`/api/public/compare?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`);
    } catch {
      const res = localAuthEngine.compareUsers(u1, u2);
      if (!res) throw new Error('Could not compare profiles.');
      return res;
    }
  },
};
