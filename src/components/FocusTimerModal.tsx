import React, { useState, useEffect, useRef } from 'react';
import { SubjectType } from '../types';
import { X, Play, Pause, RotateCcw, Check, Clock, Atom, FlaskConical, Pi, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTime: (minutes: number, subject: SubjectType | 'general') => void;
  initialSubject?: SubjectType | 'general';
  dayNumber: number;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  onSaveTime,
  initialSubject = 'general',
  dayNumber,
}) => {
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [subject, setSubject] = useState<SubjectType | 'general'>(initialSubject);
  const [seconds, setSeconds] = useState(0);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(50); // 50 min default
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setSubject(initialSubject);
  }, [initialSubject]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (mode === 'pomodoro') {
            if (prev <= 1) {
              setIsRunning(false);
              try {
                confetti({ particleCount: 70, spread: 80 });
              } catch {}
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  if (!isOpen) return null;

  const handleStart = () => {
    if (mode === 'pomodoro' && seconds === 0) {
      setSeconds(pomodoroMinutes * 60);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(mode === 'pomodoro' ? pomodoroMinutes * 60 : 0);
  };

  const handleFinishAndSave = () => {
    setIsRunning(false);
    const elapsedSeconds = mode === 'stopwatch' ? seconds : (pomodoroMinutes * 60 - seconds);
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

    onSaveTime(elapsedMins, subject);
    
    try {
      confetti({ particleCount: 50, spread: 60, colors: ['#f59e0b', '#10b981', '#0ea5e9'] });
    } catch {}

    setSeconds(0);
    onClose();
  };

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div 
      id="focus-timer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#18181B] border border-[#27272A] rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden text-center">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27272A] relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#09090B] border border-[#27272A] text-amber-400 text-xs font-mono font-bold">
              FOCUS SESSION
            </span>
            <span className="text-xs text-zinc-400 font-mono">Day {dayNumber}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#09090B] hover:bg-zinc-800 text-zinc-400 hover:text-white transition border border-[#27272A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-3">
          <button
            onClick={() => {
              setMode('stopwatch');
              setIsRunning(false);
              setSeconds(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-zinc-100 text-black shadow-sm'
                : 'bg-[#09090B] text-zinc-400 border border-[#27272A]'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => {
              setMode('pomodoro');
              setIsRunning(false);
              setSeconds(pomodoroMinutes * 60);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-zinc-100 text-black shadow-sm'
                : 'bg-[#09090B] text-zinc-400 border border-[#27272A]'
            }`}
          >
            Pomodoro Target
          </button>
        </div>

        {/* Pomodoro presets */}
        {mode === 'pomodoro' && (
          <div className="flex justify-center gap-1.5 mb-4">
            {[25, 50, 90, 180].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setPomodoroMinutes(mins);
                  setSeconds(mins * 60);
                  setIsRunning(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  pomodoroMinutes === mins
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-[#09090B] text-zinc-400 border border-[#27272A] hover:bg-zinc-800'
                }`}
              >
                {mins === 180 ? '3h (JEE Exam)' : `${mins}m`}
              </button>
            ))}
          </div>
        )}

        {/* Subject Tag Selector */}
        <div className="grid grid-cols-4 gap-1.5 mb-6">
          <button
            onClick={() => setSubject('physics')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              subject === 'physics'
                ? 'bg-blue-500/20 border border-blue-500 text-blue-300'
                : 'bg-[#09090B] text-zinc-400 border border-[#27272A]'
            }`}
          >
            <Atom className="w-3 h-3" />
            <span>PHY</span>
          </button>
          <button
            onClick={() => setSubject('chemistry')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              subject === 'chemistry'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                : 'bg-[#09090B] text-zinc-400 border border-[#27272A]'
            }`}
          >
            <FlaskConical className="w-3 h-3" />
            <span>CHEM</span>
          </button>
          <button
            onClick={() => setSubject('mathematics')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              subject === 'mathematics'
                ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                : 'bg-[#09090B] text-zinc-400 border border-[#27272A]'
            }`}
          >
            <Pi className="w-3 h-3" />
            <span>MATH</span>
          </button>
          <button
            onClick={() => setSubject('general')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              subject === 'general'
                ? 'bg-zinc-800 border border-zinc-500 text-zinc-200'
                : 'bg-[#09090B] text-zinc-400 border border-[#27272A]'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>GEN</span>
          </button>
        </div>

        {/* Big Timer Digits */}
        <div className="my-6 py-6 px-4 bg-[#09090B] rounded-3xl border border-[#27272A]">
          <div className="font-mono text-5xl sm:text-6xl font-bold text-white tracking-wider">
            {formatTime(seconds)}
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-2 uppercase tracking-widest">
            {isRunning ? '🔥 Focus In Progress' : 'Ready / Paused'}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-[#09090B] hover:bg-zinc-800 text-zinc-300 transition active:scale-95 border border-[#27272A] cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-zinc-100 hover:bg-white text-black font-bold font-mono text-sm uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Session</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold font-mono text-sm uppercase tracking-wider flex items-center gap-2 border border-[#27272A] transition active:scale-95 cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleFinishAndSave}
            disabled={seconds === 0 && mode === 'stopwatch'}
            className="px-4 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold font-mono text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Save Logged Study Time to Today"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save</span>
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 font-mono">
          Logged study time credits directly to Day {dayNumber} ({subject.toUpperCase()}).
        </p>
      </div>
    </div>
  );
};

