import React, { useState, useEffect } from 'react';
import { calculateCountdown, CountdownTime, getCurrentMissionDayNumber, MISSION_END_DATE, TARGET_EXAM_DATE, TOTAL_MISSION_DAYS } from '../utils/dateUtils';
import { UserAccount } from '../types';
import { 
  Timer, 
  Download, 
  Users, 
  Globe, 
  Sparkles, 
  User, 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays,
  Scale
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'chapters' | 'calendar' | 'community' | 'compare';
  setActiveTab: (tab: 'dashboard' | 'chapters' | 'calendar' | 'community' | 'compare') => void;
  onOpenTimer: () => void;
  onOpenBackup: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  syncStatus?: 'synced' | 'saving' | 'offline' | 'error';
  syncTimestamp?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenTimer,
  onOpenBackup,
  currentUser,
  onOpenAuth,
  onOpenSettings,
  syncStatus = 'synced',
}) => {
  const [examCountdown, setExamCountdown] = useState<CountdownTime>(calculateCountdown(TARGET_EXAM_DATE));
  const { currentDay } = getCurrentMissionDayNumber();

  useEffect(() => {
    const interval = setInterval(() => {
      setExamCountdown(calculateCountdown(TARGET_EXAM_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="main-app-header" className="border-b border-[#27272A] bg-[#09090B] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Main Title */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-500/50" />
                <h1 className="text-lg sm:text-xl font-light tracking-[0.2em] text-[#F4F4F5] uppercase">
                  JEE MAIN 2027 — <span className="text-amber-500 font-bold">MISSION 148</span>
                </h1>
              </div>
              <p className="text-[10px] tracking-[0.22em] text-zinc-400 uppercase mt-0.5 pl-4 font-mono">
                148 DAYS. ONE MISSION. // DAY 1: 24 AUG 2026 // TARGET: AIR &lt; 10,000 (95+ %ILE)
              </p>
            </div>

            {/* Quick Actions (Mobile) */}
            <div className="flex lg:hidden items-center gap-2">
              {currentUser ? (
                <button
                  onClick={onOpenSettings}
                  className="px-2.5 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>@{currentUser.username}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Profile</span>
                </button>
              )}
              <button
                id="btn-quick-timer-mobile"
                onClick={onOpenTimer}
                className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-amber-400 hover:bg-[#27272A] transition cursor-pointer"
                title="Focus Study Timer"
              >
                <Timer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dual Countdowns Bar & Cloud Status */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto justify-center lg:justify-end">
            {/* Day and Exam Countdown */}
            <div className="text-right">
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Day</p>
              <p className="text-base sm:text-lg font-mono text-amber-500 font-bold">
                {String(currentDay).padStart(3, '0')} <span className="text-zinc-600 font-normal">/</span> {TOTAL_MISSION_DAYS}
              </p>
            </div>

            <div className="text-right border-l border-zinc-800 pl-4 sm:pl-6">
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Exam Countdown</p>
              <div className="flex items-baseline gap-1 font-mono text-base sm:text-lg text-[#F4F4F5]">
                <span className="font-bold text-amber-500">{examCountdown.days}D</span>
                <span className="text-xs text-zinc-500 font-normal">
                  {String(examCountdown.hours).padStart(2, '0')}:{String(examCountdown.minutes).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* User Account / Profile Creation Widget */}
            <div className="hidden lg:flex items-center gap-2 border-l border-zinc-800 pl-4 sm:pl-6">
              {currentUser ? (
                <button
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-zinc-200 text-xs font-mono flex items-center gap-2 transition cursor-pointer"
                  title="Account & Public Profile Settings"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                    @{currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white leading-tight">@{currentUser.username}</div>
                    <div className="text-[9px] text-zinc-400 leading-tight">
                      {currentUser.isPublic ? 'Public Profile' : 'Private Profile'}
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ml-1 ${
                      syncStatus === 'saving'
                        ? 'bg-amber-400 animate-spin'
                        : syncStatus === 'synced'
                        ? 'bg-emerald-400'
                        : 'bg-zinc-500'
                    }`}
                    title={`Cloud Sync: ${syncStatus}`}
                  />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Profile / Sign In</span>
                </button>
              )}

              <button
                id="btn-quick-timer-desktop"
                onClick={onOpenTimer}
                className="px-2.5 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-amber-400 hover:bg-[#27272A] text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Focus Study Timer"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>TIMER</span>
              </button>

              <button
                id="btn-backup-desktop"
                onClick={onOpenBackup}
                className="p-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-zinc-200 hover:bg-[#27272A] transition cursor-pointer"
                title="Backup / Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
