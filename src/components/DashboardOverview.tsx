import React from 'react';
import { MissionStats, UserProfileData } from '../types';
import { getCurrentMissionDayNumber, TOTAL_MISSION_DAYS } from '../utils/dateUtils';
import { 
  Flame, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Target, 
  CalendarDays,
  Sparkles,
  Atom,
  FlaskConical,
  Pi,
  Plus,
  Play,
  FileSpreadsheet,
  Trophy,
  Award
} from 'lucide-react';

interface DashboardOverviewProps {
  profileData: UserProfileData;
  stats: MissionStats;
  onOpenAddChapter: () => void;
  onSelectDay: (dayNum: number) => void;
  onOpenTimer: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profileData,
  stats,
  onOpenAddChapter,
  onSelectDay,
  onOpenTimer,
}) => {
  const { currentDay, daysRemaining } = getCurrentMissionDayNumber();
  const dayProgressPct = Math.min(100, Math.round((currentDay / TOTAL_MISSION_DAYS) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Mission Control Banner in Sophisticated Dark */}
      <div 
        id="dashboard-hero-banner"
        className="relative overflow-hidden rounded-2xl bg-[#18181B] border border-[#27272A] p-6 sm:p-7 shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border border-zinc-700 bg-[#09090B] text-zinc-300">
                ACTIVE ASPIRANT: {(profileData?.name || profileData?.username || 'MY MISSION').toUpperCase()}
              </span>
              <span className="text-xs text-zinc-600 font-mono">•</span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider">JEE MAIN 2027</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#F4F4F5] flex flex-wrap items-center gap-2">
              <span>Target:</span>
              <span className="font-bold text-amber-500">AIR Under 10,000</span>
              <span className="text-zinc-600 font-light">•</span>
              <span className="font-semibold text-emerald-400 text-xl sm:text-2xl">95+ Percentile</span>
            </h2>

            <p className="text-xs text-zinc-400 max-w-xl italic flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>"{profileData.quote || '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).'}"</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              id="btn-hero-add-chapter"
              onClick={onOpenAddChapter}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-zinc-100 text-black hover:bg-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Add Chapter</span>
            </button>

            <button
              id="btn-hero-study-now"
              onClick={onOpenTimer}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#09090B] hover:bg-zinc-800 border border-[#27272A] text-[#F4F4F5] font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Study Timer</span>
            </button>

            <button
              id="btn-hero-today-log"
              onClick={() => onSelectDay(currentDay)}
              className="px-3.5 py-2.5 rounded-xl bg-[#09090B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 hover:text-white text-xs font-mono font-medium flex items-center justify-center gap-2 transition cursor-pointer"
              title="Jump to Today's Tracker"
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              <span>D{currentDay} Tracker</span>
            </button>
          </div>
        </div>

        {/* 148-Day Mission Timeline Bar */}
        <div className="mt-6 pt-5 border-t border-[#27272A]">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[#F4F4F5] font-bold">DAY {currentDay}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{TOTAL_MISSION_DAYS}</span>
              <span className="text-zinc-500">({dayProgressPct}% elapsed)</span>
            </div>
            <div className="text-right">
              <span className="text-amber-500 font-bold">{daysRemaining} Days</span>
              <span className="text-zinc-500"> remaining</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.max(1, dayProgressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid Stats Cards in Sophisticated Dark */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Overall Progress */}
        <div id="stat-overall-progress" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Overall</span>
            <Target className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] font-mono">
              {stats.overallProgress}%
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-tight">Syllabus Mastered</p>
          </div>
        </div>

        {/* Study Hours */}
        <div id="stat-study-hours" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Study Time</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] font-mono">
              {stats.totalStudyHours}<span className="text-sm text-zinc-500 font-sans font-normal ml-0.5">h</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-tight">Hours Logged</p>
          </div>
        </div>

        {/* Chapters */}
        <div id="stat-chapters-count" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Chapters</span>
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] font-mono">
              {stats.completedChapters}<span className="text-sm text-zinc-500 font-normal">/{stats.totalChapters}</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-tight">Completed</p>
          </div>
        </div>

        {/* Lectures */}
        <div id="stat-lectures-count" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Lectures</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] font-mono">
              {stats.totalLecturesCompleted}<span className="text-sm text-zinc-500 font-normal">/{stats.totalLecturesCount}</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-tight">Watched</p>
          </div>
        </div>

        {/* PYQs Solved */}
        <div id="stat-pyqs-count" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">PYQs</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] font-mono">
              {stats.totalPyqsCompleted}<span className="text-sm text-zinc-500 font-normal">{stats.totalPyqsCount > 0 ? `/${stats.totalPyqsCount}` : ''}</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-tight">Questions Solved</p>
          </div>
        </div>

        {/* Revisions & Streak */}
        <div id="stat-streak-revisions" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Streak / Rev</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] font-mono flex items-baseline gap-1">
              <span>{stats.currentStreak}</span>
              <span className="text-xs text-amber-500 font-sans font-bold">d</span>
              <span className="text-xs text-zinc-600">|</span>
              <span className="text-base text-zinc-300">{stats.totalRevisions}×</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-tight">Study Streak</p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Mastery Cards in Sophisticated Dark */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Physics */}
        <div id="subject-card-physics" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border border-zinc-700 bg-[#09090B] flex items-center justify-center text-[10px] font-mono font-bold text-blue-400">
                P
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Physics</h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {profileData.chapters.filter(c => c.subject === 'physics').length} Chapters added
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-400 font-mono">{stats.physicsProgress}%</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.physicsProgress}%` }}
            />
          </div>
        </div>

        {/* Chemistry */}
        <div id="subject-card-chemistry" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border border-zinc-700 bg-[#09090B] flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400">
                C
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Chemistry</h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {profileData.chapters.filter(c => c.subject === 'chemistry').length} Chapters added
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-emerald-400 font-mono">{stats.chemistryProgress}%</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.chemistryProgress}%` }}
            />
          </div>
        </div>

        {/* Mathematics */}
        <div id="subject-card-mathematics" className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border border-zinc-700 bg-[#09090B] flex items-center justify-center text-[10px] font-mono font-bold text-amber-500">
                M
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Mathematics</h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {profileData.chapters.filter(c => c.subject === 'mathematics').length} Chapters added
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-500 font-mono">{stats.mathsProgress}%</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.mathsProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mock Test Performance Section */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#09090B] border border-amber-500/30 flex items-center justify-center text-amber-500">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>JEE Mock Test Analytics</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  300 MARKS BENCHMARK
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Log test days directly on any date in the 148-day calendar
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectDay(currentDay)}
            className="px-3.5 py-1.5 rounded-xl bg-[#09090B] hover:bg-zinc-800 text-zinc-200 border border-[#27272A] text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>+ Log Test on Today (D{currentDay})</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
              Tests Given
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{stats.totalMockTests || 0}</span>
            </div>
          </div>

          <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
              Highest Score
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>{stats.highestMockScore || 0}</span>
              <span className="text-xs text-zinc-500 font-normal">/300</span>
            </div>
          </div>

          <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
              Average Score
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400 flex items-center gap-1.5">
              <span>{stats.avgMockScore || 0}</span>
              <span className="text-xs text-zinc-500 font-normal">/300</span>
            </div>
          </div>

          <div className="bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">
              95+%ile (AIR &lt;10k)
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              <span>150+</span>
              <span className="text-xs text-zinc-500 font-normal">/300</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

