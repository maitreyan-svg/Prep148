import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  Flame,
  Clock,
  BookOpen,
  CheckCircle2,
  Share2,
  Eye,
  Scale,
  Sparkles,
  Award,
  Zap,
  Globe,
  RefreshCw,
  X
} from 'lucide-react';
import { LeaderboardItem, PublicUserProfile, UserAccount } from '../types';
import { api } from '../utils/authApi';

interface PublicCommunityViewProps {
  currentUser?: UserAccount | null;
  initialCompareUser?: string | null;
  initialTab?: 'leaderboard' | 'compare';
  onOpenAuth: () => void;
}

export const PublicCommunityView: React.FC<PublicCommunityViewProps> = ({
  currentUser,
  initialCompareUser,
  initialTab = 'leaderboard',
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'compare'>(initialTab);
  const [sortBy, setSortBy] = useState<'progress' | 'hours' | 'pyqs' | 'lectures' | 'streak'>('progress');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Sync initial tab when prop updates
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Compare State
  const [user1Name, setUser1Name] = useState<string>(currentUser?.username || 'nibir');
  const [user2Name, setUser2Name] = useState<string>(initialCompareUser || 'maitreyan');
  const [compareData, setCompareData] = useState<{ user1: PublicUserProfile | null; user2: PublicUserProfile | null }>({
    user1: null,
    user2: null,
  });
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Single User Profile Modal
  const [selectedUserProfile, setSelectedUserProfile] = useState<PublicUserProfile | null>(null);
  const [loadingProfileModal, setLoadingProfileModal] = useState(false);

  // Copy toast
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await api.getLeaderboard(sortBy);
      setLeaderboard(res.leaderboard || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  // Handle Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchPublicUsers(searchQuery);
        setSearchResults(res.results || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Compare Data
  const loadCompare = async (u1: string, u2: string) => {
    if (!u1 || !u2) return;
    setLoadingCompare(true);
    setCompareError(null);
    try {
      const res = await api.comparePublicUsers(u1, u2);
      setCompareData({
        user1: res.user1,
        user2: res.user2,
      });
    } catch (err: any) {
      setCompareError(err.message || 'Could not load side-by-side comparison.');
    } finally {
      setLoadingCompare(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'compare') {
      loadCompare(user1Name, user2Name);
    }
  }, [activeTab, user1Name, user2Name]);

  // If initial compare user provided, switch to compare tab
  useEffect(() => {
    if (initialCompareUser) {
      setUser2Name(initialCompareUser);
      setActiveTab('compare');
    }
  }, [initialCompareUser]);

  const viewUserProfile = async (username: string) => {
    setLoadingProfileModal(true);
    try {
      const res = await api.getPublicProfile(username);
      setSelectedUserProfile(res.profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfileModal(false);
    }
  };

  const startCompareWith = (targetUsername: string) => {
    if (currentUser) {
      setUser1Name(currentUser.username);
      setUser2Name(targetUsername);
    } else {
      setUser1Name('nibir');
      setUser2Name(targetUsername);
    }
    setActiveTab('compare');
    if (selectedUserProfile) {
      setSelectedUserProfile(null);
    }
  };

  const copyShareLink = (username: string) => {
    const url = `${window.location.origin}${window.location.pathname}?u=${encodeURIComponent(username)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                JEE Main 2027 Public Network
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-amber-500" />
              <span>Public Community & Compare</span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1 max-w-2xl">
              Real JEE aspirants tracking the 148-Day Mission. Compare metrics side-by-side, compete on the preparation leaderboard, and stay accountable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Leaderboard (Sign Up)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">Signed in as:</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#09090B] border border-[#27272A] text-amber-400 font-mono text-xs font-bold">
                  @{currentUser.username}
                </span>
                <button
                  onClick={() => copyShareLink(currentUser.username)}
                  className="px-3 py-1.5 rounded-lg bg-[#09090B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 font-mono text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3 text-amber-500" />
                  <span>{copiedLink ? 'Copied!' : 'My Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#18181B] text-zinc-400 hover:text-white border border-[#27272A]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Public Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'compare'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#18181B] text-zinc-400 hover:text-white border border-[#27272A]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Side-by-Side Compare</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search aspirant @username..."
            className="w-full bg-[#18181B] border border-[#27272A] focus:border-amber-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search dropdown results */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#121215] border border-[#27272A] rounded-xl shadow-2xl z-30 overflow-hidden font-mono divide-y divide-[#27272A]">
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  className="p-3 hover:bg-zinc-800/60 transition flex items-center justify-between gap-2"
                >
                  <div className="cursor-pointer" onClick={() => viewUserProfile(res.username)}>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{res.name}</span>
                      <span className="text-amber-500 font-normal">@{res.username}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {res.overallProgress}% Progress • {res.totalStudyHours} hrs • {res.currentStreak}d Streak
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => viewUserProfile(res.username)}
                      className="p-1.5 rounded-lg bg-[#18181B] hover:bg-zinc-700 text-zinc-300 transition"
                      title="View Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startCompareWith(res.username)}
                      className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold transition"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= TAB 1: LEADERBOARD ================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Sorting metrics selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18181B] p-3 rounded-2xl border border-[#27272A]">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>Rank Leaderboard By:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'progress', label: '148-Day Progress %', icon: Trophy },
                { id: 'hours', label: 'Study Hours', icon: Clock },
                { id: 'pyqs', label: 'PYQs Solved', icon: BookOpen },
                { id: 'lectures', label: 'Lectures Done', icon: Zap },
                { id: 'streak', label: 'Day Streak', icon: Flame },
              ].map((filter) => {
                const Icon = filter.icon;
                const isSelected = sortBy === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSortBy(filter.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-black font-bold shadow-md'
                        : 'bg-[#09090B] text-zinc-400 hover:text-white border border-[#27272A]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{filter.label}</span>
                  </button>
                );
              })}

              <button
                onClick={fetchLeaderboard}
                className="p-1.5 rounded-xl bg-[#09090B] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-[#27272A] transition ml-1"
                title="Refresh Leaderboard"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          {loadingLeaderboard ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-sm bg-[#18181B] rounded-2xl border border-[#27272A]">
              Loading real public JEE aspirants...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 font-mono text-sm bg-[#18181B] rounded-2xl border border-[#27272A]">
              No public aspirants available yet. Be the first to join by creating an account!
            </div>
          ) : (
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-[#27272A] bg-[#09090B]/50 text-[11px] text-zinc-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Rank</th>
                      <th className="py-3.5 px-4">Aspirant</th>
                      <th className="py-3.5 px-4 text-center">148-Day Progress</th>
                      <th className="py-3.5 px-4 text-center">Study Hours</th>
                      <th className="py-3.5 px-4 text-center">PYQs Done</th>
                      <th className="py-3.5 px-4 text-center">Lectures</th>
                      <th className="py-3.5 px-4 text-center">Streak</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]/60 text-xs">
                    {leaderboard.map((item) => {
                      const isCurrentUser = currentUser?.username === item.username;
                      const isTop3 = item.rank <= 3;
                      const rankBadge =
                        item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : item.rank === 3 ? '🥉 #3' : `#${item.rank}`;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-zinc-800/40 transition ${
                            isCurrentUser ? 'bg-amber-500/5 font-semibold' : ''
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3.5 px-4 font-bold">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs ${
                                item.rank === 1
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black'
                                  : item.rank === 2
                                  ? 'bg-zinc-400/20 text-zinc-200 border border-zinc-400/40'
                                  : item.rank === 3
                                  ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {rankBadge}
                            </span>
                          </td>

                          {/* Aspirant Details */}
                          <td className="py-3.5 px-4">
                            <div
                              onClick={() => viewUserProfile(item.username)}
                              className="cursor-pointer group flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center font-bold text-amber-500 group-hover:border-amber-500/50 transition">
                                @{item.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white group-hover:text-amber-400 transition font-bold flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                  {isCurrentUser && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-black font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-500 font-mono">@{item.username}</div>
                              </div>
                            </div>
                          </td>

                          {/* Progress */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="w-28 mx-auto space-y-1">
                              <div className="flex justify-between text-[10px] text-zinc-400">
                                <span>{item.completedChapters}/{item.totalChapters} Ch</span>
                                <span className="font-bold text-emerald-400">{item.overallProgress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(100, item.overallProgress)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Hours */}
                          <td className="py-3.5 px-4 text-center font-bold text-zinc-200">
                            <span>{item.totalStudyHours}h</span>
                            <span className="block text-[10px] text-zinc-500 font-normal">
                              ({item.avgDailyHours}h/day)
                            </span>
                          </td>

                          {/* PYQs */}
                          <td className="py-3.5 px-4 text-center text-zinc-300 font-mono font-medium">
                            {item.totalPyqsCompleted}
                          </td>

                          {/* Lectures */}
                          <td className="py-3.5 px-4 text-center text-zinc-300 font-mono font-medium">
                            {item.totalLecturesCompleted}
                          </td>

                          {/* Streak */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                              <Flame className="w-3 h-3 text-orange-400" />
                              <span>{item.currentStreak}d</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => viewUserProfile(item.username)}
                                className="px-2.5 py-1 rounded-lg bg-[#09090B] hover:bg-zinc-700 text-zinc-300 border border-[#27272A] text-xs transition cursor-pointer"
                                title="View detailed profile"
                              >
                                View
                              </button>
                              <button
                                onClick={() => startCompareWith(item.username)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
                                title="Compare side-by-side"
                              >
                                Compare
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: SIDE-BY-SIDE COMPARE ================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Aspirant Selectors */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Aspirant 1 (User ID)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={user1Name}
                    onChange={(e) => setUser1Name(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. nibir"
                    className="w-full bg-[#09090B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center pt-2 sm:pt-4">
                <div className="w-10 h-10 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center font-mono font-bold text-amber-500 text-xs">
                  VS
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Aspirant 2 (User ID)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={user2Name}
                    onChange={(e) => setUser2Name(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. maitreyan"
                    className="w-full bg-[#09090B] border border-[#27272A] focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 sm:pt-4">
                <button
                  onClick={() => loadCompare(user1Name, user2Name)}
                  disabled={loadingCompare}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCompare ? 'animate-spin' : ''}`} />
                  <span>Update Comparison</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Content */}
          {loadingCompare ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-sm bg-[#18181B] rounded-2xl border border-[#27272A]">
              Loading side-by-side comparison metrics...
            </div>
          ) : compareError ? (
            <div className="p-8 text-center text-red-400 font-mono text-xs bg-red-500/5 rounded-2xl border border-red-500/20">
              {compareError}
            </div>
          ) : compareData.user1 && compareData.user2 ? (
            <div className="space-y-6">
              {/* Dual Profile Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User 1 Card */}
                <div className="bg-[#18181B] border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 font-mono font-bold text-xl">
                        @{compareData.user1.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                          <span>{compareData.user1.name}</span>
                          <span className="text-xs font-normal text-amber-500 font-mono">@{compareData.user1.username}</span>
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono">{compareData.user1.targetPercentile}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyShareLink(compareData.user1!.username)}
                      className="p-1.5 rounded-lg bg-[#09090B] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-[#27272A] text-xs transition cursor-pointer"
                      title="Share profile link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 italic mt-3 bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] font-mono">
                    "{compareData.user1.quote || '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).'}"
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Progress</div>
                      <div className="text-lg font-bold font-mono text-amber-400">
                        {compareData.user1.stats.target148Progress}%
                      </div>
                    </div>
                    <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Hours</div>
                      <div className="text-lg font-bold font-mono text-white">
                        {compareData.user1.stats.totalStudyHours}h
                      </div>
                    </div>
                    <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Streak</div>
                      <div className="text-lg font-bold font-mono text-orange-400 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4" />
                        <span>{compareData.user1.stats.currentStreak}d</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User 2 Card */}
                <div className="bg-[#18181B] border border-blue-500/30 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-bold text-xl">
                        @{compareData.user2.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                          <span>{compareData.user2.name}</span>
                          <span className="text-xs font-normal text-blue-400 font-mono">@{compareData.user2.username}</span>
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono">{compareData.user2.targetPercentile}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyShareLink(compareData.user2!.username)}
                      className="p-1.5 rounded-lg bg-[#09090B] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-[#27272A] text-xs transition cursor-pointer"
                      title="Share profile link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 italic mt-3 bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] font-mono">
                    "{compareData.user2.quote || 'Consistency beats talent when talent stops working.'}"
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Progress</div>
                      <div className="text-lg font-bold font-mono text-blue-400">
                        {compareData.user2.stats.target148Progress}%
                      </div>
                    </div>
                    <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Hours</div>
                      <div className="text-lg font-bold font-mono text-white">
                        {compareData.user2.stats.totalStudyHours}h
                      </div>
                    </div>
                    <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Streak</div>
                      <div className="text-lg font-bold font-mono text-orange-400 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4" />
                        <span>{compareData.user2.stats.currentStreak}d</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Detailed Comparison Table & Progress Meters */}
              <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-5">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 border-b border-[#27272A] pb-3">
                  <Scale className="w-4 h-4 text-amber-500" />
                  <span>Deep Preparation Metrics Comparison</span>
                </h3>

                {/* Metric Rows */}
                <div className="space-y-4 font-mono">
                  {/* Row 1: Target 148 Progress */}
                  <div className="bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold text-amber-400">
                        @{compareData.user1.username}: {compareData.user1.stats.target148Progress}%
                      </span>
                      <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                        148-Day Overall Completion
                      </span>
                      <span className="font-bold text-blue-400">
                        @{compareData.user2.username}: {compareData.user2.stats.target148Progress}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden flex justify-end">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, compareData.user1.stats.target148Progress)}%` }}
                        />
                      </div>
                      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, compareData.user2.stats.target148Progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Study Hours & Averages */}
                  <div className="bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-amber-400 font-bold">
                        {compareData.user1.stats.totalStudyHours} hrs ({compareData.user1.stats.avgDailyHours}h/day)
                      </span>
                      <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                        Study Hours & Daily Pace
                      </span>
                      <span className="text-blue-400 font-bold">
                        {compareData.user2.stats.totalStudyHours} hrs ({compareData.user2.stats.avgDailyHours}h/day)
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Physics Progress */}
                  <div className="bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-amber-400">
                        {compareData.user1.subjectStats.physics.completedChapters}/{compareData.user1.subjectStats.physics.chapters} Ch ({compareData.user1.subjectStats.physics.progress}%)
                      </span>
                      <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px] text-amber-500">
                        Physics Mastery
                      </span>
                      <span className="text-blue-400">
                        {compareData.user2.subjectStats.physics.completedChapters}/{compareData.user2.subjectStats.physics.chapters} Ch ({compareData.user2.subjectStats.physics.progress}%)
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Chemistry Progress */}
                  <div className="bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-amber-400">
                        {compareData.user1.subjectStats.chemistry.completedChapters}/{compareData.user1.subjectStats.chemistry.chapters} Ch ({compareData.user1.subjectStats.chemistry.progress}%)
                      </span>
                      <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px] text-emerald-400">
                        Chemistry Mastery
                      </span>
                      <span className="text-blue-400">
                        {compareData.user2.subjectStats.chemistry.completedChapters}/{compareData.user2.subjectStats.chemistry.chapters} Ch ({compareData.user2.subjectStats.chemistry.progress}%)
                      </span>
                    </div>
                  </div>

                  {/* Row 5: Maths Progress */}
                  <div className="bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-amber-400">
                        {compareData.user1.subjectStats.mathematics.completedChapters}/{compareData.user1.subjectStats.mathematics.chapters} Ch ({compareData.user1.subjectStats.mathematics.progress}%)
                      </span>
                      <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px] text-blue-400">
                        Mathematics Mastery
                      </span>
                      <span className="text-blue-400">
                        {compareData.user2.subjectStats.mathematics.completedChapters}/{compareData.user2.subjectStats.mathematics.chapters} Ch ({compareData.user2.subjectStats.mathematics.progress}%)
                      </span>
                    </div>
                  </div>

                  {/* Row 6: PYQs & Lectures Solved */}
                  <div className="bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-amber-400">
                        <div>{compareData.user1.stats.completedPyqs} PYQs</div>
                        <div className="text-[11px] text-zinc-500">{compareData.user1.stats.completedLectures} Lectures</div>
                      </div>
                      <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                        Practice Volume (PYQs & Lectures)
                      </span>
                      <div className="text-blue-400 text-right">
                        <div>{compareData.user2.stats.completedPyqs} PYQs</div>
                        <div className="text-[11px] text-zinc-500">{compareData.user2.stats.completedLectures} Lectures</div>
                      </div>
                    </div>
                  </div>

                  {/* Row 7: Short Notes & Revisions */}
                  <div className="bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-amber-400">
                        <div>{compareData.user1.stats.shortNotesCount} Notes Made</div>
                        <div className="text-[11px] text-zinc-500">{compareData.user1.stats.totalRevisions} Revisions Done</div>
                      </div>
                      <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                        Retention & Revisions
                      </span>
                      <div className="text-blue-400 text-right">
                        <div>{compareData.user2.stats.shortNotesCount} Notes Made</div>
                        <div className="text-[11px] text-zinc-500">{compareData.user2.stats.totalRevisions} Revisions Done</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ================= USER PROFILE MODAL ================= */}
      {selectedUserProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#121215] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden my-8 font-mono">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500" />

            <div className="p-6">
              <div className="flex items-start justify-between pb-4 border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-xl">
                    @{selectedUserProfile.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{selectedUserProfile.name}</span>
                      <span className="text-xs font-normal text-amber-500">@{selectedUserProfile.username}</span>
                    </h3>
                    <p className="text-xs text-zinc-400">{selectedUserProfile.targetPercentile}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserProfile(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-zinc-300 italic my-4 bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
                "{selectedUserProfile.quote || '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).'}"
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                  <div className="text-[10px] text-zinc-500 uppercase">Progress</div>
                  <div className="text-base font-bold text-amber-400">{selectedUserProfile.stats.target148Progress}%</div>
                </div>
                <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                  <div className="text-[10px] text-zinc-500 uppercase">Hours</div>
                  <div className="text-base font-bold text-white">{selectedUserProfile.stats.totalStudyHours}h</div>
                </div>
                <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                  <div className="text-[10px] text-zinc-500 uppercase">Streak</div>
                  <div className="text-base font-bold text-orange-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{selectedUserProfile.stats.currentStreak}d</span>
                  </div>
                </div>
                <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                  <div className="text-[10px] text-zinc-500 uppercase">PYQs</div>
                  <div className="text-base font-bold text-emerald-400">{selectedUserProfile.stats.completedPyqs}</div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-2 mb-5">
                <div className="text-xs font-bold text-zinc-400 uppercase">Subject Syllabus Progress</div>
                <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-amber-400">Physics:</span>
                    <span>{selectedUserProfile.subjectStats.physics.completedChapters}/{selectedUserProfile.subjectStats.physics.chapters} Ch ({selectedUserProfile.subjectStats.physics.progress}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Chemistry:</span>
                    <span>{selectedUserProfile.subjectStats.chemistry.completedChapters}/{selectedUserProfile.subjectStats.chemistry.chapters} Ch ({selectedUserProfile.subjectStats.chemistry.progress}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">Mathematics:</span>
                    <span>{selectedUserProfile.subjectStats.mathematics.completedChapters}/{selectedUserProfile.subjectStats.mathematics.chapters} Ch ({selectedUserProfile.subjectStats.mathematics.progress}%)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                <button
                  onClick={() => copyShareLink(selectedUserProfile.username)}
                  className="px-3 py-2 rounded-xl bg-[#09090B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
                </button>

                <button
                  onClick={() => startCompareWith(selectedUserProfile.username)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare with this Aspirant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
