import React, { useState, useEffect, useCallback } from 'react';
import { Chapter, DailyLog, SubjectType, UserProfileData, UserAccount } from './types';
import { loadProfileData, saveProfileData } from './utils/storage';
import { calculateProfileStats } from './utils/calculator';
import { getCurrentMissionDayNumber } from './utils/dateUtils';
import { api } from './utils/authApi';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { SubjectChaptersView } from './components/SubjectChaptersView';
import { Mission148Calendar } from './components/Mission148Calendar';
import { PublicCommunityView } from './components/PublicCommunityView';
import { AddChapterModal } from './components/AddChapterModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { DataBackupModal } from './components/DataBackupModal';
import { AuthModal } from './components/AuthModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Plus,
  Globe,
  Scale,
  Sparkles,
  UserPlus
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chapters' | 'calendar' | 'community' | 'compare'>('dashboard');

  // User Account & Session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'error'>('synced');
  const [initialCompareUser, setInitialCompareUser] = useState<string | null>(null);

  // Active Profile Data State
  const [profileData, setProfileData] = useState<UserProfileData>(() => loadProfileData('my_profile'));

  // Modals state
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [addChapterSubject, setAddChapterSubject] = useState<SubjectType | undefined>('physics');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSubject, setTimerSubject] = useState<SubjectType | 'general'>('general');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Calculated Stats
  const currentStats = calculateProfileStats(profileData);
  const { currentDay } = getCurrentMissionDayNumber();

  // Check URL query parameters (e.g. ?u=rohit or ?compare=username)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('u') || urlParams.get('profile') || urlParams.get('user');
    const compareParam = urlParams.get('compare');

    if (userParam || compareParam) {
      setInitialCompareUser(compareParam || userParam);
      setActiveTab(compareParam ? 'compare' : 'community');
    }
  }, []);

  // Check existing login session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.getCurrentUser();
        if (res.user) {
          setCurrentUser(res.user);
          // Load user's cloud persistent data
          try {
            const cloudDataRes = await api.getUserData();
            if (cloudDataRes.data) {
              setProfileData(cloudDataRes.data);
              saveProfileData(cloudDataRes.data, 'my_profile');
            }
          } catch (e) {
            console.error('Failed to load cloud user data:', e);
          }
        }
      } catch (err) {
        // Guest mode
      }
    };
    initAuth();
  }, []);

  // Cloud Sync Handler helper
  const syncToCloud = useCallback(async (data: UserProfileData) => {
    if (!api.getToken()) return;
    setSyncStatus('saving');
    try {
      await api.syncUserData(data);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Cloud auto-sync failed:', err);
      setSyncStatus('error');
    }
  }, []);

  // Update profile helper
  const updateProfile = (updater: (prev: UserProfileData) => UserProfileData) => {
    setProfileData((prev) => {
      const next = updater(prev);
      saveProfileData(next, 'my_profile');
      syncToCloud(next);
      return next;
    });
  };

  // Chapter handlers
  const handleAddChapter = (newChapter: Chapter) => {
    updateProfile((prev) => ({
      ...prev,
      chapters: [newChapter, ...prev.chapters],
    }));
  };

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    updateProfile((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) => (c.id === updatedChapter.id ? updatedChapter : c)),
    }));
  };

  const handleDeleteChapter = (chapterId: string) => {
    updateProfile((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((c) => c.id !== chapterId),
    }));
  };

  // Daily Log handlers
  const handleUpdateDailyLog = (updatedLog: DailyLog) => {
    updateProfile((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [updatedLog.dayNumber]: updatedLog,
      },
    }));
  };

  // Focus timer save handler
  const handleSaveTimerTime = (minutes: number, subject: SubjectType | 'general') => {
    const targetDay = selectedDayNumber || currentDay;
    updateProfile((prev) => {
      const existingLog = prev.dailyLogs[targetDay];
      const prevMins = existingLog?.studyMinutes || 0;
      const subMins = existingLog?.subjectMinutes || { physics: 0, chemistry: 0, mathematics: 0, general: 0 };
      
      const updatedSubMins = {
        ...subMins,
        [subject]: (subMins[subject] || 0) + minutes,
      };

      const updatedLog: DailyLog = {
        ...existingLog,
        dayNumber: targetDay,
        studyMinutes: prevMins + minutes,
        status: existingLog.status === 'untracked' ? 'in-progress' : existingLog.status,
        subjectMinutes: updatedSubMins,
      };

      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [targetDay]: updatedLog,
        },
      };
    });
  };

  // Handle successful login or register
  const handleAuthSuccess = async (user: UserAccount, data?: UserProfileData) => {
    setCurrentUser(user);
    if (data) {
      setProfileData(data);
      saveProfileData(data, 'my_profile');
    } else {
      await syncToCloud(profileData);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Main Command Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTimer={() => {
          setTimerSubject('general');
          setIsTimerOpen(true);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        syncStatus={syncStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Guest Mode Callout Banner */}
        {!currentUser && (
          <div className="bg-gradient-to-r from-amber-500/10 via-[#18181B] to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>Create Your JEE 2027 Public Profile</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold uppercase">
                    100% Free
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Create your profile to rank on the live Public Leaderboard, compare with peers across India, and save your progress.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Profile</span>
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 hover:text-white font-mono text-xs transition cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto bg-[#18181B] p-1 rounded-2xl border border-[#27272A]">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-100 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>DASHBOARD</span>
            </button>

            <button
              id="nav-tab-chapters"
              onClick={() => setActiveTab('chapters')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'chapters'
                  ? 'bg-zinc-100 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>CHAPTERS</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#09090B] text-[10px] font-mono text-zinc-300 border border-zinc-800">
                {profileData.chapters.length}
              </span>
            </button>

            <button
              id="nav-tab-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-zinc-100 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>148 CALENDAR</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#09090B] text-[10px] font-mono text-amber-400 font-bold border border-zinc-800">
                D{currentDay}
              </span>
            </button>

            <button
              id="nav-tab-community"
              onClick={() => setActiveTab('community')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-bold shadow-sm'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-800/80'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>PUBLIC COMMUNITY</span>
            </button>

            <button
              id="nav-tab-compare"
              onClick={() => setActiveTab('compare')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>COMPARE RADAR</span>
            </button>
          </div>

          {/* Quick Add Chapter Action */}
          <div className="flex items-center gap-2 justify-end">
            <button
              id="btn-quick-add-chapter"
              onClick={() => {
                setAddChapterSubject('physics');
                setIsAddChapterOpen(true);
              }}
              className="bg-zinc-100 text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-white transition-colors uppercase tracking-tight flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Add Chapter</span>
            </button>
          </div>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'community' || activeTab === 'compare' ? (
          <PublicCommunityView
            currentUser={currentUser}
            initialCompareUser={initialCompareUser}
            initialTab={activeTab === 'compare' ? 'compare' : 'leaderboard'}
            onOpenAuth={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
          />
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <DashboardOverview
              profileData={profileData}
              stats={currentStats}
              onOpenAddChapter={() => {
                setAddChapterSubject('physics');
                setIsAddChapterOpen(true);
              }}
              onSelectDay={(dayNum) => {
                setSelectedDayNumber(dayNum);
                setActiveTab('calendar');
              }}
              onOpenTimer={() => {
                setTimerSubject('general');
                setIsTimerOpen(true);
              }}
            />

            {/* Inline Recent Chapters View */}
            <SubjectChaptersView
              chapters={profileData.chapters}
              onAddChapter={(subj) => {
                setAddChapterSubject(subj);
                setIsAddChapterOpen(true);
              }}
              onUpdateChapter={handleUpdateChapter}
              onDeleteChapter={handleDeleteChapter}
            />
          </div>
        ) : activeTab === 'chapters' ? (
          <SubjectChaptersView
            chapters={profileData.chapters}
            onAddChapter={(subj) => {
              setAddChapterSubject(subj);
              setIsAddChapterOpen(true);
            }}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
          />
        ) : (
          <Mission148Calendar
            dailyLogs={profileData.dailyLogs}
            chapters={profileData.chapters}
            onUpdateLog={handleUpdateDailyLog}
            initialSelectedDay={selectedDayNumber || currentDay}
            onOpenTimerForSubject={(subj) => {
              setTimerSubject(subj);
              setIsTimerOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272A] bg-[#09090B] py-6 mt-12 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">JEE MAIN 2027</span>
            <span>•</span>
            <span>148-Day Mission Tracker (Day 1: 24 Aug 2026)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>Target: AIR &lt; 10,000</span>
            <span>•</span>
            <span>95+ Percentile</span>
            <span>•</span>
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Public Aspirant Network
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AddChapterModal
        isOpen={isAddChapterOpen}
        onClose={() => setIsAddChapterOpen(false)}
        onAddChapter={handleAddChapter}
        defaultSubject={addChapterSubject}
      />

      <FocusTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onSaveTime={handleSaveTimerTime}
        defaultSubject={timerSubject}
      />

      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onExport={() => {}}
        onImportSuccess={() => {
          setProfileData(loadProfileData('my_profile'));
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        currentLocalData={profileData}
      />

      {currentUser && (
        <ProfileSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentUser={currentUser}
          onProfileUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
          }}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
