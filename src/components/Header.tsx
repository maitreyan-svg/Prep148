import React, { useState, useEffect } from 'react';
import { calculateCountdown, CountdownTime, getCurrentMissionDayNumber, MISSION_END_DATE, TARGET_EXAM_DATE, TOTAL_MISSION_DAYS } from '../utils/dateUtils';
import { ProfileType } from '../types';
import { Clock, Flame, Shield, Users, Timer, Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeProfile: ProfileType;
  setActiveProfile: (profile: ProfileType) => void;
  viewMode: 'single' | 'compare';
  setViewMode: (mode: 'single' | 'compare') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenTimer: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  setActiveProfile,
  viewMode,
  setViewMode,
  onOpenTimer,
  onOpenBackup,
}) => {
  const [missionCountdown, setMissionCountdown] = useState<CountdownTime>(calculateCountdown(MISSION_END_DATE));
  const [examCountdown, setExamCountdown] = useState<CountdownTime>(calculateCountdown(TARGET_EXAM_DATE));
  const { currentDay } = getCurrentMissionDayNumber();

  useEffect(() => {
    const interval = setInterval(() => {
      setMissionCountdown(calculateCountdown(MISSION_END_DATE));
      setExamCountdown(calculateCountdown(TARGET_EXAM_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="main-app-header" className="border-b border-[#27272A] bg-[#09090B] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Main Title */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h1 className="text-xl sm:text-2xl font-light tracking-[0.2em] text-[#F4F4F5] uppercase">
                  NIBIR MAITREYAN — <span className="text-amber-500 font-bold">JEE MISSION 148</span>
                </h1>
              </div>
              <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase mt-1 pl-4 font-mono">
                148 DAYS. ONE MISSION. // TARGET: AIR &lt; 10,000 (95+ %ILE)
              </p>
            </div>

            {/* Quick Actions (Mobile) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                id="btn-quick-timer-mobile"
                onClick={onOpenTimer}
                className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-amber-400 hover:bg-[#27272A] transition"
                title="Focus Study Timer"
              >
                <Timer className="w-4 h-4" />
              </button>
              <button
                id="btn-backup-mobile"
                onClick={onOpenBackup}
                className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white transition"
                title="Backup / Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dual Countdowns Bar in Sophisticated Dark Grid */}
          <div className="flex items-center gap-6 sm:gap-8 w-full lg:w-auto justify-center lg:justify-end">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Mission Day</p>
              <p className="text-lg sm:text-xl font-mono text-amber-500 font-bold">
                {String(currentDay).padStart(3, '0')} <span className="text-zinc-600 font-normal">/</span> {TOTAL_MISSION_DAYS}
              </p>
            </div>

            <div className="text-right border-l border-zinc-800 pl-6 sm:pl-8">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Exam Countdown</p>
              <div className="flex items-baseline gap-1 font-mono text-lg sm:text-xl text-[#F4F4F5]">
                <span className="font-bold text-amber-500">{examCountdown.days}D</span>
                <span className="text-xs text-zinc-500 font-normal">
                  {String(examCountdown.hours).padStart(2, '0')}:{String(examCountdown.minutes).padStart(2, '0')}:{String(examCountdown.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Profile Switcher & Actions */}
            <div className="border-l border-zinc-800 pl-6 sm:pl-8 flex items-center gap-2">
              <div className="bg-[#18181B] p-1 rounded-xl border border-[#27272A] flex items-center gap-1">
                <button
                  id="btn-profile-nibir"
                  onClick={() => {
                    setActiveProfile('nibir');
                    setViewMode('single');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'single' && activeProfile === 'nibir'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>NIBIR</span>
                </button>

                <button
                  id="btn-profile-maitreyan"
                  onClick={() => {
                    setActiveProfile('maitreyan');
                    setViewMode('single');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'single' && activeProfile === 'maitreyan'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>MAITREYAN</span>
                </button>

                <button
                  id="btn-profile-compare"
                  onClick={() => setViewMode('compare')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition flex items-center gap-1 cursor-pointer ${
                    viewMode === 'compare'
                      ? 'bg-amber-500 text-black shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title="Mutual Performance & Accountability Radar"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">RADAR</span>
                </button>
              </div>

              {/* Desktop Quick Timer & Backup */}
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  id="btn-quick-timer-desktop"
                  onClick={onOpenTimer}
                  className="px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-amber-400 hover:bg-[#27272A] text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer"
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
      </div>
    </header>
  );
};

