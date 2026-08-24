import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Globe,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Share2,
  LogOut,
  Cloud,
  ShieldCheck,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { UserAccount } from '../types';
import { api } from '../utils/authApi';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUserUpdate: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  syncTimestamp?: string | null;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  onLogout,
  syncTimestamp,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile fields
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [quote, setQuote] = useState(user.quote || '');
  const [targetDailyHours, setTargetDailyHours] = useState(user.targetDailyHours || 10);
  const [targetPercentile, setTargetPercentile] = useState(user.targetPercentile || '95+ Percentile (AIR < 10,000)');
  const [avatar, setAvatar] = useState(user.avatar || 'amber');

  // Privacy fields
  const [isPublic, setIsPublic] = useState(user.isPublic !== undefined ? user.isPublic : true);
  const [showSubjectBreakdown, setShowSubjectBreakdown] = useState(user.privacySettings?.showSubjectBreakdown !== false);
  const [showStreaks, setShowStreaks] = useState(user.privacySettings?.showStreaks !== false);
  const [showStudyHours, setShowStudyHours] = useState(user.privacySettings?.showStudyHours !== false);

  // Security / Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.updateProfile({
        name,
        username,
        quote,
        targetDailyHours: Number(targetDailyHours),
        targetPercentile,
        avatar,
      });

      onUserUpdate(res.user);
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.updateSettings({
        isPublic,
        privacySettings: {
          showSubjectBreakdown,
          showStreaks,
          showStudyHours,
          showDailyLogs: false, // Never expose raw private notes
        },
      });

      onUserUpdate(res.user);
      setSuccessMsg('Privacy preferences updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update privacy settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setSuccessMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const copyProfileLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?u=${encodeURIComponent(user.username)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#121215] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#27272A] mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono font-bold text-lg">
                @{user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span>{user.name || user.username}</span>
                  <span className="text-xs font-normal text-amber-500 font-mono">@{user.username}</span>
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span>{user.email}</span>
                  <span>•</span>
                  {user.isPublic ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <Globe className="w-3 h-3" /> Public Profile
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Private Profile
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#18181B] rounded-xl border border-[#27272A] mb-5">
            <button
              onClick={() => {
                setActiveTab('profile');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-mono font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Info</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('privacy');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-mono font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public & Privacy</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('security');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-mono font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= TAB 1: PROFILE INFO ================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Unique User ID (@username)
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Daily Study Target (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={targetDailyHours}
                    onChange={(e) => setTargetDailyHours(Number(e.target.value))}
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Rank Target / Percentile
                  </label>
                  <input
                    type="text"
                    value={targetPercentile}
                    onChange={(e) => setTargetPercentile(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Motto / Aspirant Quote
                </label>
                <textarea
                  rows={2}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono resize-none"
                />
              </div>

              {/* Cloud Sync Status */}
              <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <Cloud className="w-4 h-4 text-amber-500" />
                  <span>Cloud Database Sync: <strong className="text-emerald-400">Active & Persistent</strong></span>
                </div>
                {syncTimestamp && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Synced: {new Date(syncTimestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={copyProfileLink}
                  className="px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Profile Link'}</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: PUBLIC & PRIVACY ================= */}
          {activeTab === 'privacy' && (
            <form onSubmit={handleSavePrivacy} className="space-y-4">
              {/* Public Profile Master Switch */}
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-500" />
                      <span>Public Profile & Leaderboard</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Enable to appear on the JEE Public Leaderboard and allow other aspirants to compare 148-day progress with you.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPublic ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isPublic ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[11px] font-mono text-zinc-400 space-y-1">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Protection Guarantee:
                  </div>
                  <div>• Passwords, email address, and personal contact info are <strong className="text-zinc-200">100% hidden</strong>.</div>
                  <div>• Private daily journal logs/notes are <strong className="text-zinc-200">strictly private</strong>.</div>
                  <div>• Only aggregate preparation statistics (hours, completion %, chapters done) are visible to comparison viewers.</div>
                </div>
              </div>

              {/* Granular Privacy Controls */}
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Public Analytics Preferences
                </h4>

                <label className="flex items-center justify-between py-1.5 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-mono text-zinc-300">Share Physics, Chemistry & Maths Progress</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showSubjectBreakdown}
                    onChange={(e) => setShowSubjectBreakdown(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-1.5 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-mono text-zinc-300">Share Total Study Hours & Daily Averages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showStudyHours}
                    onChange={(e) => setShowStudyHours(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-1.5 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-mono text-zinc-300">Share Consistency Streaks & Milestones</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showStreaks}
                    onChange={(e) => setShowStreaks(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving Preferences...' : 'Save Privacy Preferences'}
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: SECURITY & LOGOUT ================= */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <form onSubmit={handleChangePassword} className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Change Account Password
                </h4>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-[#09090B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-[#09090B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* Logout Area */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-red-400">Account Session</h4>
                  <p className="text-[11px] text-zinc-400 font-mono">Sign out of this device. Your data is safely preserved in the database.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
