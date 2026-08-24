import React from 'react';
import { MissionStats, ProfileType, UserProfileData } from '../types';
import { calculateProfileStats, SUBJECT_INFO } from '../utils/calculator';
import { 
  Users, 
  Flame, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  RotateCw, 
  Target, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Trophy,
  Zap
} from 'lucide-react';

interface DualComparisonViewProps {
  nibirData: UserProfileData;
  maitreyanData: UserProfileData;
  onSwitchToProfile: (profile: ProfileType) => void;
  onOpenCommunity?: () => void;
}

export const DualComparisonView: React.FC<DualComparisonViewProps> = ({
  nibirData,
  maitreyanData,
  onSwitchToProfile,
  onOpenCommunity,
}) => {
  const nibirStats: MissionStats = calculateProfileStats(nibirData);
  const maitreyanStats: MissionStats = calculateProfileStats(maitreyanData);

  // Comparison metrics
  const metrics = [
    {
      title: 'Overall Syllabus Mastery',
      nibirVal: `${nibirStats.overallProgress}%`,
      maitreyanVal: `${maitreyanStats.overallProgress}%`,
      nibirRaw: nibirStats.overallProgress,
      maitreyanRaw: maitreyanStats.overallProgress,
      icon: Target,
      unit: '%',
    },
    {
      title: 'Total Study Hours',
      nibirVal: `${nibirStats.totalStudyHours}h`,
      maitreyanVal: `${maitreyanStats.totalStudyHours}h`,
      nibirRaw: nibirStats.totalStudyHours,
      maitreyanRaw: maitreyanStats.totalStudyHours,
      icon: Clock,
      unit: 'h',
    },
    {
      title: 'Completed Chapters',
      nibirVal: `${nibirStats.completedChapters} / ${nibirStats.totalChapters}`,
      maitreyanVal: `${maitreyanStats.completedChapters} / ${maitreyanStats.totalChapters}`,
      nibirRaw: nibirStats.completedChapters,
      maitreyanRaw: maitreyanStats.completedChapters,
      icon: BookOpen,
    },
    {
      title: 'PYQs Solved',
      nibirVal: `${nibirStats.totalPyqsCompleted}`,
      maitreyanVal: `${maitreyanStats.totalPyqsCompleted}`,
      nibirRaw: nibirStats.totalPyqsCompleted,
      maitreyanRaw: maitreyanStats.totalPyqsCompleted,
      icon: CheckCircle2,
    },
    {
      title: 'Total Revisions',
      nibirVal: `${nibirStats.totalRevisions}×`,
      maitreyanVal: `${maitreyanStats.totalRevisions}×`,
      nibirRaw: nibirStats.totalRevisions,
      maitreyanRaw: maitreyanStats.totalRevisions,
      icon: RotateCw,
    },
    {
      title: 'Consistency Streak',
      nibirVal: `${nibirStats.currentStreak} Days`,
      maitreyanVal: `${maitreyanStats.currentStreak} Days`,
      nibirRaw: nibirStats.currentStreak,
      maitreyanRaw: maitreyanStats.currentStreak,
      icon: Flame,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Mutual Radar Header */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>DUAL PERFORMANCE & ACCOUNTABILITY RADAR</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Nibir <span className="text-zinc-600">⚡</span> Maitreyan
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg font-medium">
              Peer-to-peer accountability for JEE Main 2027. Track syllabus completion, study time, problem solving, and revision cycles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenCommunity && (
              <button
                onClick={onOpenCommunity}
                className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold font-mono text-xs rounded-xl flex items-center gap-1.5 transition border border-amber-500/30 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Public Community & Leaderboard</span>
              </button>
            )}
            <button
              onClick={() => onSwitchToProfile('nibir')}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-black font-bold font-mono text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Switch to Nibir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSwitchToProfile('maitreyan')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold font-mono text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-[#27272A]"
            >
              <span>Switch to Maitreyan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nibir Card */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-amber-500/40 flex items-center justify-center text-amber-500 font-bold text-lg font-mono">
                  N
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Nibir</h3>
                  <p className="text-xs text-zinc-400 font-mono">Mission Day 148 Aspirant</p>
                </div>
              </div>

              <button
                onClick={() => onSwitchToProfile('nibir')}
                className="px-3 py-1.5 bg-[#09090B] hover:bg-zinc-800 text-zinc-300 border border-[#27272A] text-xs font-mono font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 italic mb-6 bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
              "{nibirData.quote || '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).'}"
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] text-center">
                <div className="text-lg font-bold text-amber-500 font-mono">
                  {nibirStats.overallProgress}%
                </div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Overall</div>
              </div>

              <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] text-center">
                <div className="text-lg font-bold text-white font-mono">
                  {nibirStats.totalStudyHours}h
                </div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Study Time</div>
              </div>

              <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] text-center">
                <div className="text-lg font-bold text-amber-500 font-mono">
                  {nibirStats.currentStreak}d
                </div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Streak</div>
              </div>
            </div>

            {/* Subject Mastery Mini Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-blue-400">Physics ({nibirData.chapters.filter((c) => c.subject === 'physics').length} ch)</span>
                  <span className="text-white font-bold">{nibirStats.physicsProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${nibirStats.physicsProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-400">Chemistry ({nibirData.chapters.filter((c) => c.subject === 'chemistry').length} ch)</span>
                  <span className="text-white font-bold">{nibirStats.chemistryProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${nibirStats.chemistryProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-500">Mathematics ({nibirData.chapters.filter((c) => c.subject === 'mathematics').length} ch)</span>
                  <span className="text-white font-bold">{nibirStats.mathsProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${nibirStats.mathsProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maitreyan Card */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg font-mono">
                  M
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Maitreyan</h3>
                  <p className="text-xs text-zinc-400 font-mono">Mission Day 148 Aspirant</p>
                </div>
              </div>

              <button
                onClick={() => onSwitchToProfile('maitreyan')}
                className="px-3 py-1.5 bg-[#09090B] hover:bg-zinc-800 text-zinc-300 border border-[#27272A] text-xs font-mono font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 italic mb-6 bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
              "{maitreyanData.quote || 'Consistency beats talent when talent stops working.'}"
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] text-center">
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {maitreyanStats.overallProgress}%
                </div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Overall</div>
              </div>

              <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] text-center">
                <div className="text-lg font-bold text-white font-mono">
                  {maitreyanStats.totalStudyHours}h
                </div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Study Time</div>
              </div>

              <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] text-center">
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {maitreyanStats.currentStreak}d
                </div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Streak</div>
              </div>
            </div>

            {/* Subject Mastery Mini Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-blue-400">Physics ({maitreyanData.chapters.filter((c) => c.subject === 'physics').length} ch)</span>
                  <span className="text-white font-bold">{maitreyanStats.physicsProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${maitreyanStats.physicsProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-400">Chemistry ({maitreyanData.chapters.filter((c) => c.subject === 'chemistry').length} ch)</span>
                  <span className="text-white font-bold">{maitreyanStats.chemistryProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${maitreyanStats.chemistryProgress}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-500">Mathematics ({maitreyanData.chapters.filter((c) => c.subject === 'mathematics').length} ch)</span>
                  <span className="text-white font-bold">{maitreyanStats.mathsProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${maitreyanStats.mathsProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Detailed Comparison Metrics */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Head-to-Head Mission Radar</span>
        </h3>

        <div className="space-y-3">
          {metrics.map((m, idx) => {
            const Icon = m.icon;

            return (
              <div key={idx} className="bg-[#09090B] p-4 rounded-2xl border border-[#27272A]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold font-mono uppercase tracking-wider">
                    <Icon className="w-4 h-4 text-amber-500" />
                    <span>{m.title}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  {/* Nibir Side */}
                  <div className="flex items-center justify-between bg-[#18181B] p-2.5 rounded-xl border border-[#27272A]">
                    <span className="text-xs text-amber-500 font-bold font-mono">Nibir</span>
                    <span className="text-sm font-bold text-white font-mono">{m.nibirVal}</span>
                  </div>

                  {/* Maitreyan Side */}
                  <div className="flex items-center justify-between bg-[#18181B] p-2.5 rounded-xl border border-[#27272A]">
                    <span className="text-xs text-emerald-400 font-bold font-mono">Maitreyan</span>
                    <span className="text-sm font-bold text-white font-mono">{m.maitreyanVal}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

