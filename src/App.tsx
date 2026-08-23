import React, { useState } from 'react';
import { Chapter, DailyLog, ProfileType, SubjectType, UserProfileData } from './types';
import { loadProfileData, saveProfileData } from './utils/storage';
import { calculateProfileStats } from './utils/calculator';
import { getCurrentMissionDayNumber } from './utils/dateUtils';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { SubjectChaptersView } from './components/SubjectChaptersView';
import { Mission148Calendar } from './components/Mission148Calendar';
import { DualComparisonView } from './components/DualComparisonView';
import { AddChapterModal } from './components/AddChapterModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { DataBackupModal } from './components/DataBackupModal';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Plus
} from 'lucide-react';

export default function App() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>('nibir');
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chapters' | 'calendar'>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Profile data state
  const [nibirData, setNibirData] = useState<UserProfileData>(() => loadProfileData('nibir'));
  const [maitreyanData, setMaitreyanData] = useState<UserProfileData>(() => loadProfileData('maitreyan'));

  // Modals state
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [addChapterSubject, setAddChapterSubject] = useState<SubjectType | undefined>('physics');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSubject, setTimerSubject] = useState<SubjectType | 'general'>('general');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Sync active profile data
  const currentProfileData = activeProfile === 'nibir' ? nibirData : maitreyanData;
  const currentStats = calculateProfileStats(currentProfileData);
  const { currentDay } = getCurrentMissionDayNumber();

  // Reload data from local storage when requested
  const reloadData = () => {
    setNibirData(loadProfileData('nibir'));
    setMaitreyanData(loadProfileData('maitreyan'));
  };

  // Update current profile helper
  const updateCurrentProfile = (updater: (prev: UserProfileData) => UserProfileData) => {
    if (activeProfile === 'nibir') {
      setNibirData((prev) => {
        const next = updater(prev);
        saveProfileData(next);
        return next;
      });
    } else {
      setMaitreyanData((prev) => {
        const next = updater(prev);
        saveProfileData(next);
        return next;
      });
    }
  };

  // Chapter handlers
  const handleAddChapter = (newChapter: Chapter) => {
    updateCurrentProfile((prev) => ({
      ...prev,
      chapters: [newChapter, ...prev.chapters],
    }));
  };

  const handleUpdateChapter = (updatedChapter: Chapter) => {
    updateCurrentProfile((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) => (c.id === updatedChapter.id ? updatedChapter : c)),
    }));
  };

  const handleDeleteChapter = (chapterId: string) => {
    updateCurrentProfile((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((c) => c.id !== chapterId),
    }));
  };

  // Daily Log handlers
  const handleUpdateDailyLog = (updatedLog: DailyLog) => {
    updateCurrentProfile((prev) => ({
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
    updateCurrentProfile((prev) => {
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

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Main Command Header */}
      <Header
        activeProfile={activeProfile}
        setActiveProfile={setActiveProfile}
        viewMode={viewMode}
        setViewMode={setViewMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenTimer={() => {
          setTimerSubject('general');
          setIsTimerOpen(true);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs (When in Single Profile Mode) */}
        {viewMode === 'single' && (
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
                  {currentProfileData.chapters.length}
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
            </div>

            {/* Quick Context Action */}
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
        )}

        {/* View Switcher Routing */}
        {viewMode === 'compare' ? (
          <DualComparisonView
            nibirData={nibirData}
            maitreyanData={maitreyanData}
            onSwitchToProfile={(prof) => {
              setActiveProfile(prof);
              setViewMode('single');
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <DashboardOverview
                  profileData={currentProfileData}
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

                {/* Inline Recent Chapters Section on Dashboard */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Syllabus & Chapter Trackers</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('chapters')}
                      className="text-xs font-mono text-amber-500 hover:underline uppercase tracking-wide"
                    >
                      View All Chapters →
                    </button>
                  </div>

                  <SubjectChaptersView
                    chapters={currentProfileData.chapters}
                    onUpdateChapter={handleUpdateChapter}
                    onDeleteChapter={handleDeleteChapter}
                    onOpenAddModal={(sub) => {
                      setAddChapterSubject(sub || 'physics');
                      setIsAddChapterOpen(true);
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'chapters' && (
              <div>
                <SubjectChaptersView
                  chapters={currentProfileData.chapters}
                  onUpdateChapter={handleUpdateChapter}
                  onDeleteChapter={handleDeleteChapter}
                  onOpenAddModal={(sub) => {
                    setAddChapterSubject(sub || 'physics');
                    setIsAddChapterOpen(true);
                  }}
                />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div>
                <Mission148Calendar
                  profileData={currentProfileData}
                  onUpdateDailyLog={handleUpdateDailyLog}
                  selectedDayNumber={selectedDayNumber}
                  onSelectDay={(dayNum) => setSelectedDayNumber(dayNum)}
                  onLaunchTimerForSubject={(sub, dayNum) => {
                    setTimerSubject(sub);
                    setSelectedDayNumber(dayNum);
                    setIsTimerOpen(true);
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

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
        initialSubject={timerSubject}
        dayNumber={selectedDayNumber || currentDay}
      />

      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        activeProfile={activeProfile}
        onDataChanged={reloadData}
      />

      {/* Sophisticated Dark Footer with Live Status Indicators */}
      <footer className="px-8 py-5 bg-[#09090B] border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-8 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] uppercase text-zinc-400">Nibir Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] uppercase text-zinc-400">Maitreyan Synchronized</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
          MISSION STATUS: 148 DAYS // JEE MAIN 2027 TARGET // AIR UNDER 100
        </p>
      </footer>
    </div>
  );
}

