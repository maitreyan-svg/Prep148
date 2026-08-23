import React, { useState } from 'react';
import { DailyLog, DailyTask, DayStatus, SubjectType, UserProfileData } from '../types';
import { getCurrentMissionDayNumber, TOTAL_MISSION_DAYS } from '../utils/dateUtils';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Droplet, 
  Utensils, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Filter, 
  X,
  Play,
  Coffee,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Mission148CalendarProps {
  profileData: UserProfileData;
  onUpdateDailyLog: (log: DailyLog) => void;
  selectedDayNumber: number | null;
  onSelectDay: (dayNum: number | null) => void;
  onLaunchTimerForSubject: (subject: SubjectType | 'general', dayNum: number) => void;
}

export const Mission148Calendar: React.FC<Mission148CalendarProps> = ({
  profileData,
  onUpdateDailyLog,
  selectedDayNumber,
  onSelectDay,
  onLaunchTimerForSubject,
}) => {
  const { currentDay } = getCurrentMissionDayNumber();
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jumpInput, setJumpInput] = useState<string>('');
  
  // Task input state inside modal
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState<SubjectType | 'general'>('general');

  const logs = profileData.dailyLogs || {};

  // Months list for tabs
  const months = [
    { key: 'all', label: 'All 148 Days' },
    { key: '2026-08', label: 'Aug 2026 (D1-D9)' },
    { key: '2026-09', label: 'Sep 2026 (D10-D39)' },
    { key: '2026-10', label: 'Oct 2026 (D40-D70)' },
    { key: '2026-11', label: 'Nov 2026 (D71-D100)' },
    { key: '2026-12', label: 'Dec 2026 (D101-D131)' },
    { key: '2027-01', label: 'Jan 2027 (D132-D148)' },
  ];

  // Filter day numbers
  const dayNumbers = Array.from({ length: TOTAL_MISSION_DAYS }, (_, i) => i + 1).filter((num) => {
    const log = logs[num];
    if (!log) return true;

    // Month filter
    if (monthFilter !== 'all') {
      if (!log.dateStr.startsWith(monthFilter)) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'test-day') {
        if (!log.isTestDay && !log.mockTest) return false;
      } else if (log.status !== statusFilter) {
        return false;
      }
    }

    return true;
  });

  const selectedLog: DailyLog | undefined = selectedDayNumber ? logs[selectedDayNumber] : undefined;

  const handleJumpToDay = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= TOTAL_MISSION_DAYS) {
      onSelectDay(num);
      setJumpInput('');
    }
  };

  // Trigger celebratory confetti on day complete or mock test
  const triggerDoneEffect = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#38bdf8', '#a855f7'],
      });
    } catch {
      // ignore
    }
  };

  // Helper updates for selected day
  const handleStatusChange = (status: DayStatus) => {
    if (!selectedLog) return;
    const updated: DailyLog = { ...selectedLog, status };
    onUpdateDailyLog(updated);
    if (status === 'completed') triggerDoneEffect();
  };

  const handleToggleTestDay = () => {
    if (!selectedLog) return;
    const nextIsTestDay = !selectedLog.isTestDay;
    const updated: DailyLog = {
      ...selectedLog,
      isTestDay: nextIsTestDay,
      mockTest: nextIsTestDay
        ? (selectedLog.mockTest || {
            testName: `Mock Test - Day ${selectedLog.dayNumber}`,
            testType: 'full',
            score: 0,
            totalMarks: 300,
            physicsScore: 0,
            chemistryScore: 0,
            mathsScore: 0,
            analysisRemarks: '',
          })
        : selectedLog.mockTest,
    };
    onUpdateDailyLog(updated);
    if (nextIsTestDay) triggerDoneEffect();
  };

  const handleUpdateMockTest = (patch: Partial<NonNullable<DailyLog['mockTest']>>) => {
    if (!selectedLog) return;
    const currentMock = selectedLog.mockTest || {
      testName: `Mock Test - Day ${selectedLog.dayNumber}`,
      testType: 'full',
      score: 0,
      totalMarks: 300,
      physicsScore: 0,
      chemistryScore: 0,
      mathsScore: 0,
      analysisRemarks: '',
    };
    const newMock = { ...currentMock, ...patch };
    if ('physicsScore' in patch || 'chemistryScore' in patch || 'mathsScore' in patch) {
      const p = patch.physicsScore !== undefined ? patch.physicsScore : (currentMock.physicsScore || 0);
      const c = patch.chemistryScore !== undefined ? patch.chemistryScore : (currentMock.chemistryScore || 0);
      const m = patch.mathsScore !== undefined ? patch.mathsScore : (currentMock.mathsScore || 0);
      if (p > 0 || c > 0 || m > 0) {
        newMock.score = p + c + m;
      }
    }
    onUpdateDailyLog({
      ...selectedLog,
      isTestDay: true,
      mockTest: newMock,
    });
  };

  const handleStudyMinutesAdjust = (delta: number) => {
    if (!selectedLog) return;
    const nextMins = Math.max(0, (selectedLog.studyMinutes || 0) + delta);
    onUpdateDailyLog({ ...selectedLog, studyMinutes: nextMins });
  };

  const handleSubjectMinutesChange = (subject: 'physics' | 'chemistry' | 'mathematics' | 'general', delta: number) => {
    if (!selectedLog) return;
    const current = selectedLog.subjectMinutes || { physics: 0, chemistry: 0, mathematics: 0, general: 0 };
    const nextVal = Math.max(0, (current[subject] || 0) + delta);
    const updatedSubMins = { ...current, [subject]: nextVal };
    const totalMins = updatedSubMins.physics + updatedSubMins.chemistry + updatedSubMins.mathematics + updatedSubMins.general;
    onUpdateDailyLog({
      ...selectedLog,
      subjectMinutes: updatedSubMins,
      studyMinutes: Math.max(totalMins, selectedLog.studyMinutes),
    });
  };

  const handleToggleMeal = (mealKey: 'breakfast' | 'lunch' | 'dinner') => {
    if (!selectedLog) return;
    const nextVal = !selectedLog.meals[mealKey];
    onUpdateDailyLog({
      ...selectedLog,
      meals: {
        ...selectedLog.meals,
        [mealKey]: nextVal,
      },
    });
  };

  const handleWaterAdjust = (delta: number) => {
    if (!selectedLog) return;
    const nextVal = Math.max(0, (selectedLog.waterGlasses || 0) + delta);
    onUpdateDailyLog({
      ...selectedLog,
      waterGlasses: nextVal,
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog || !newTaskText.trim()) return;

    const newTask: DailyTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: newTaskText.trim(),
      done: false,
      subject: newTaskSubject,
    };

    onUpdateDailyLog({
      ...selectedLog,
      tasks: [...(selectedLog.tasks || []), newTask],
    });
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    if (!selectedLog) return;
    const updatedTasks = selectedLog.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    onUpdateDailyLog({
      ...selectedLog,
      tasks: updatedTasks,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedLog) return;
    const updatedTasks = selectedLog.tasks.filter((t) => t.id !== taskId);
    onUpdateDailyLog({
      ...selectedLog,
      tasks: updatedTasks,
    });
  };

  const handleNotesChange = (text: string) => {
    if (!selectedLog) return;
    onUpdateDailyLog({
      ...selectedLog,
      notes: text,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters and Month Switcher in Sophisticated Dark */}
      <div className="bg-[#18181B] p-4 rounded-2xl border border-[#27272A] space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Month Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {months.map((m) => (
              <button
                key={m.key}
                onClick={() => setMonthFilter(m.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition cursor-pointer ${
                  monthFilter === m.key
                    ? 'bg-zinc-100 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Jump to Day & Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="all">All Days</option>
              <option value="test-day">📝 Mock Test Days</option>
              <option value="completed">Completed 🎯</option>
              <option value="in-progress">In Progress ⏳</option>
              <option value="rest">Rest Day 🛋️</option>
              <option value="untracked">Untracked ⚪</option>
            </select>

            <form onSubmit={handleJumpToDay} className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={148}
                placeholder="Day #"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="w-16 px-2.5 py-1.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-center"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#09090B] hover:bg-zinc-800 border border-[#27272A] text-white rounded-xl text-xs font-mono font-semibold transition cursor-pointer"
              >
                Jump
              </button>
            </form>

            <button
              onClick={() => onSelectDay(currentDay)}
              className="px-3 py-1.5 bg-zinc-100 text-black rounded-xl text-xs font-mono font-bold hover:bg-white transition flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>Today (D{currentDay})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 148 Days Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {dayNumbers.map((num) => {
          const log = logs[num];
          const isToday = num === currentDay;
          const isTestDay = Boolean(log?.isTestDay || log?.mockTest);
          const studyHours = Math.round(((log?.studyMinutes || 0) / 60) * 10) / 10;
          const tasksDone = (log?.tasks || []).filter((t) => t.done).length;
          const tasksTotal = (log?.tasks || []).length;
          const status = log?.status || 'untracked';

          let statusBadge = (
            <span className="text-[10px] text-zinc-500 font-mono">Untracked</span>
          );
          if (status === 'completed') {
            statusBadge = (
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
            );
          } else if (status === 'in-progress') {
            statusBadge = (
              <span className="text-[10px] text-amber-500 font-mono font-bold">In Progress</span>
            );
          } else if (status === 'rest') {
            statusBadge = (
              <span className="text-[10px] text-blue-400 font-mono font-bold">Rest</span>
            );
          }

          return (
            <div
              key={num}
              id={`calendar-day-card-${num}`}
              onClick={() => onSelectDay(num)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isToday
                  ? 'border-amber-500 bg-[#18181B] ring-1 ring-amber-500/50'
                  : isTestDay
                  ? 'border-amber-500/50 bg-[#18181B] hover:border-amber-400'
                  : status === 'completed'
                  ? 'border-emerald-500/40 bg-[#18181B] hover:border-emerald-500'
                  : 'border-[#27272A] bg-[#18181B] hover:border-zinc-600'
              }`}
            >
              {/* Header: Day Num & Badges */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-white">
                  DAY {num}
                </span>
                <div className="flex items-center gap-1">
                  {isTestDay && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold font-mono uppercase flex items-center gap-0.5">
                      <FileSpreadsheet className="w-2.5 h-2.5" />
                      <span>Test</span>
                    </span>
                  )}
                  {isToday && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-bold uppercase font-mono">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Date String */}
              <div className="text-[11px] text-zinc-400 mb-1.5 font-medium">
                {log?.formattedDate?.split(',')[0] || `Day ${num}`}
              </div>

              {/* Test score badge if logged */}
              {isTestDay && log?.mockTest?.score !== undefined && (
                <div className="mb-2 px-1.5 py-0.5 rounded bg-[#09090B] border border-amber-500/30 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">Score:</span>
                  <span className="text-amber-400 font-bold">
                    {log.mockTest.score}/{log.mockTest.totalMarks || 300}
                  </span>
                </div>
              )}

              {/* Study Time */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-zinc-300 font-mono text-xs font-bold">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>{studyHours}h</span>
                </div>

                {log && log.waterGlasses > 0 && (
                  <div className="flex items-center gap-0.5 text-blue-400 text-[10px] font-mono">
                    <Droplet className="w-3 h-3" />
                    <span>{log.waterGlasses}</span>
                  </div>
                )}
              </div>

              {/* Footer status & tasks badge */}
              <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
                {statusBadge}
                {tasksTotal > 0 && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {tasksDone}/{tasksTotal}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Day Modal / Drawer in Sophisticated Dark */}
      {selectedDayNumber && selectedLog && (
        <div 
          id="day-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-[#18181B] border border-[#27272A] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#27272A]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#09090B] text-amber-500 border border-zinc-700 text-xs font-mono font-bold">
                    DAY {selectedLog.dayNumber} OF {TOTAL_MISSION_DAYS}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {selectedLog.formattedDate}
                  </span>
                  {selectedLog.isTestDay && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" /> Mock Test Day
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Daily Mission Tracker & Routine
                </h3>
              </div>

              <button
                onClick={() => onSelectDay(null)}
                className="p-2 rounded-xl bg-[#09090B] hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer border border-[#27272A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-4">
              {/* 1. Day Status Selector */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2 font-bold">
                  Day Completion Status:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('completed')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedLog.status === 'completed'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Completed 🎯</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('in-progress')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedLog.status === 'in-progress'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>In Progress ⏳</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('rest')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedLog.status === 'rest'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Coffee className="w-4 h-4 text-blue-400" />
                    <span>Rest Day 🛋️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('untracked')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedLog.status === 'untracked'
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                        : 'bg-[#09090B] border-[#27272A] text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    <span>Untracked ⚪</span>
                  </button>
                </div>
              </div>

              {/* 2. Mock Test Day Feature Section */}
              <div className="bg-[#09090B] p-4 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Mock Test Record</span>
                        {selectedLog.isTestDay && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            ACTIVE
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Mark day as a Mock Test Day and log 300M JEE test score breakdown
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleTestDay}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      selectedLog.isTestDay
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-[#18181B] hover:bg-zinc-800 text-zinc-300 border border-[#27272A]'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{selectedLog.isTestDay ? '✓ Marked as Test Day' : '+ Mark as Test Day'}</span>
                  </button>
                </div>

                {/* If Marked as Test Day, show Detailed Test Logging Form */}
                {selectedLog.isTestDay && (
                  <div className="space-y-3.5 pt-3 border-t border-[#27272A]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Test Name / Series:
                        </label>
                        <input
                          type="text"
                          value={selectedLog.mockTest?.testName || ''}
                          onChange={(e) => handleUpdateMockTest({ testName: e.target.value })}
                          placeholder="e.g. Allen Leader #4 / JEE Main Full Mock 1"
                          className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                          Test Format:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['full', 'part', 'chapter'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleUpdateMockTest({ testType: type })}
                              className={`py-1.5 rounded-lg text-xs font-mono capitalize transition cursor-pointer ${
                                (selectedLog.mockTest?.testType || 'full') === type
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 font-bold'
                                  : 'bg-[#18181B] text-zinc-400 border border-[#27272A] hover:text-white'
                              }`}
                            >
                              {type === 'full' ? 'Full 300M' : type === 'part' ? 'Part Test' : 'Chapter'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score Inputs */}
                    <div className="bg-[#18181B] p-3.5 rounded-xl border border-[#27272A] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                          Scores & Marks Breakdown:
                        </span>
                        <div className="font-mono text-sm font-bold text-amber-400">
                          Total: {selectedLog.mockTest?.score || 0} / {selectedLog.mockTest?.totalMarks || 300}{' '}
                          <span className="text-xs text-zinc-400">
                            ({(((selectedLog.mockTest?.score || 0) / (selectedLog.mockTest?.totalMarks || 300)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="text-[10px] text-blue-400 font-mono font-bold block mb-1">
                            Physics (/100):
                          </label>
                          <input
                            type="number"
                            min={-25}
                            max={100}
                            value={selectedLog.mockTest?.physicsScore ?? 0}
                            onChange={(e) => handleUpdateMockTest({ physicsScore: Number(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 bg-[#09090B] border border-blue-500/30 rounded-lg text-xs font-mono text-white text-center focus:outline-none focus:border-blue-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-emerald-400 font-mono font-bold block mb-1">
                            Chemistry (/100):
                          </label>
                          <input
                            type="number"
                            min={-25}
                            max={100}
                            value={selectedLog.mockTest?.chemistryScore ?? 0}
                            onChange={(e) => handleUpdateMockTest({ chemistryScore: Number(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 bg-[#09090B] border border-emerald-500/30 rounded-lg text-xs font-mono text-white text-center focus:outline-none focus:border-emerald-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-amber-400 font-mono font-bold block mb-1">
                            Maths (/100):
                          </label>
                          <input
                            type="number"
                            min={-25}
                            max={100}
                            value={selectedLog.mockTest?.mathsScore ?? 0}
                            onChange={(e) => handleUpdateMockTest({ mathsScore: Number(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 bg-[#09090B] border border-amber-500/30 rounded-lg text-xs font-mono text-white text-center focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-400 font-mono font-bold block mb-1">
                            Total Max Marks:
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={360}
                            value={selectedLog.mockTest?.totalMarks ?? 300}
                            onChange={(e) => handleUpdateMockTest({ totalMarks: Number(e.target.value) || 300 })}
                            className="w-full px-2.5 py-1.5 bg-[#09090B] border border-[#27272A] rounded-lg text-xs font-mono text-zinc-300 text-center focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* 95+ Percentile & AIR <10k Benchmark Gauge */}
                      <div className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A]">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-[11px]">95+%ile Benchmark:</span>
                          {(selectedLog.mockTest?.score || 0) >= 150 ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <span>🎯 95+ Percentile Achieved! (AIR &lt;10k Pace)</span>
                            </span>
                          ) : (selectedLog.mockTest?.score || 0) >= 120 ? (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <span>⚡ 90–94 %ile (Gap to 95%: {150 - (selectedLog.mockTest?.score || 0)} marks)</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400 flex items-center gap-1">
                              <span>🎯 Target: 150+ Marks for 95+ %ile (AIR &lt;10k)</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 hidden sm:inline">150+ / 300</span>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                          Test Analysis & Mistake Review:
                        </label>
                        <input
                          type="text"
                          value={selectedLog.mockTest?.analysisRemarks || ''}
                          onChange={(e) => handleUpdateMockTest({ analysisRemarks: e.target.value })}
                          placeholder="e.g. Lost 15 marks in silly calculation in Organic, strong performance in Modern Physics"
                          className="w-full px-3 py-1.5 bg-[#09090B] border border-[#27272A] rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Study-Time Tracker */}
              <div className="bg-[#09090B] p-4 rounded-2xl border border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono uppercase text-zinc-300 font-bold">
                      Study Time Logged:
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-white">
                    <span className="text-blue-400">{Math.floor(selectedLog.studyMinutes / 60)}h </span>
                    <span>{selectedLog.studyMinutes % 60}m</span>
                    <span className="text-xs text-zinc-500 ml-1">
                      ({Math.round((selectedLog.studyMinutes / 60) * 10) / 10} hrs)
                    </span>
                  </div>
                </div>

                {/* Quick Time Add / Subtract Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-zinc-500 font-mono mr-1">Quick Log:</span>
                  <button
                    onClick={() => handleStudyMinutesAdjust(-30)}
                    className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 text-xs font-mono transition"
                  >
                    -30m
                  </button>
                  <button
                    onClick={() => handleStudyMinutesAdjust(30)}
                    className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 text-xs font-mono transition"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => handleStudyMinutesAdjust(60)}
                    className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-amber-500 text-xs font-mono font-bold transition"
                  >
                    +1 Hour
                  </button>
                  <button
                    onClick={() => handleStudyMinutesAdjust(120)}
                    className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-emerald-400 text-xs font-mono font-bold transition"
                  >
                    +2 Hours
                  </button>

                  <button
                    onClick={() => onLaunchTimerForSubject('general', selectedLog.dayNumber)}
                    className="ml-auto px-3 py-1 bg-zinc-100 hover:bg-white text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Focus Timer</span>
                  </button>
                </div>

                {/* Subject-Wise Time Distribution */}
                <div className="pt-3 border-t border-[#27272A] grid grid-cols-3 gap-2">
                  {/* Physics */}
                  <div className="bg-[#18181B] p-2.5 rounded-xl border border-blue-500/20">
                    <div className="text-[10px] text-blue-400 font-mono font-bold uppercase mb-1">PHY</div>
                    <div className="text-xs font-mono text-white font-bold mb-1">
                      {Math.floor((selectedLog.subjectMinutes?.physics || 0) / 60)}h {(selectedLog.subjectMinutes?.physics || 0) % 60}m
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSubjectMinutesChange('physics', -15)}
                        className="px-1.5 py-0.5 bg-[#09090B] text-zinc-400 hover:text-white rounded text-[10px] border border-zinc-800"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleSubjectMinutesChange('physics', 30)}
                        className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold border border-blue-500/30"
                      >
                        +30m
                      </button>
                    </div>
                  </div>

                  {/* Chemistry */}
                  <div className="bg-[#18181B] p-2.5 rounded-xl border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase mb-1">CHEM</div>
                    <div className="text-xs font-mono text-white font-bold mb-1">
                      {Math.floor((selectedLog.subjectMinutes?.chemistry || 0) / 60)}h {(selectedLog.subjectMinutes?.chemistry || 0) % 60}m
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSubjectMinutesChange('chemistry', -15)}
                        className="px-1.5 py-0.5 bg-[#09090B] text-zinc-400 hover:text-white rounded text-[10px] border border-zinc-800"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleSubjectMinutesChange('chemistry', 30)}
                        className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold border border-emerald-500/30"
                      >
                        +30m
                      </button>
                    </div>
                  </div>

                  {/* Maths */}
                  <div className="bg-[#18181B] p-2.5 rounded-xl border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 font-mono font-bold uppercase mb-1">MATH</div>
                    <div className="text-xs font-mono text-white font-bold mb-1">
                      {Math.floor((selectedLog.subjectMinutes?.mathematics || 0) / 60)}h {(selectedLog.subjectMinutes?.mathematics || 0) % 60}m
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSubjectMinutesChange('mathematics', -15)}
                        className="px-1.5 py-0.5 bg-[#09090B] text-zinc-400 hover:text-white rounded text-[10px] border border-zinc-800"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleSubjectMinutesChange('mathematics', 30)}
                        className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold border border-amber-500/30"
                      >
                        +30m
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Daily Task Tracker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                    Daily Action Checklist:
                  </label>
                  <span className="text-xs text-zinc-400 font-mono">
                    {(selectedLog.tasks || []).filter((t) => t.done).length}/{(selectedLog.tasks || []).length} Completed
                  </span>
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value as SubjectType | 'general')}
                    className="px-2.5 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="general">General</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="mathematics">Maths</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Add day's study task (e.g. Solve 30 Electrostatics PYQs)..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-zinc-100 text-black hover:bg-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Tasks List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedLog.tasks || []).length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-2 text-center">
                      No tasks added for this day yet. Add specific goals above!
                    </p>
                  ) : (
                    selectedLog.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                          task.done
                            ? 'bg-[#09090B]/40 border-[#27272A] text-zinc-500 line-through'
                            : 'bg-[#09090B] border-[#27272A] text-white'
                        }`}
                      >
                        <div
                          onClick={() => handleToggleTask(task.id)}
                          className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] transition ${
                              task.done
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-zinc-700 bg-[#18181B]'
                            }`}
                          >
                            {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <span className="text-xs font-medium">{task.text}</span>

                          {task.subject && task.subject !== 'general' && (
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                              {task.subject.substring(0, 4)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-zinc-600 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4. Routine & Health Check-ins: Meals & Water */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Meals */}
                <div className="bg-[#09090B] p-3.5 rounded-2xl border border-[#27272A]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Utensils className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                      Meals Check-in:
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleMeal('breakfast')}
                      className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                        selectedLog.meals?.breakfast
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-[#18181B] text-zinc-500 border border-[#27272A] hover:bg-zinc-800'
                      }`}
                    >
                      <span>Breakfast</span>
                      <span className="text-[10px] font-mono">{selectedLog.meals?.breakfast ? '✓ Had' : 'Pending'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleMeal('lunch')}
                      className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                        selectedLog.meals?.lunch
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#18181B] text-zinc-500 border border-[#27272A] hover:bg-zinc-800'
                      }`}
                    >
                      <span>Lunch</span>
                      <span className="text-[10px] font-mono">{selectedLog.meals?.lunch ? '✓ Had' : 'Pending'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleMeal('dinner')}
                      className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                        selectedLog.meals?.dinner
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-[#18181B] text-zinc-500 border border-[#27272A] hover:bg-zinc-800'
                      }`}
                    >
                      <span>Dinner</span>
                      <span className="text-[10px] font-mono">{selectedLog.meals?.dinner ? '✓ Had' : 'Pending'}</span>
                    </button>
                  </div>
                </div>

                {/* Water Counter */}
                <div className="bg-[#09090B] p-3.5 rounded-2xl border border-[#27272A]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                        Water:
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold text-blue-400">
                      {selectedLog.waterGlasses || 0} glasses ({((selectedLog.waterGlasses || 0) * 0.25).toFixed(1)}L)
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => handleWaterAdjust(-1)}
                      className="w-8 h-8 rounded-xl bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-zinc-300 font-bold flex items-center justify-center text-sm transition active:scale-95"
                    >
                      -
                    </button>

                    {/* Visual Water Glasses Bar */}
                    <div className="flex items-center gap-1 overflow-x-auto py-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            onUpdateDailyLog({
                              ...selectedLog,
                              waterGlasses: i + 1,
                            });
                          }}
                          className={`w-3.5 h-6 rounded border transition cursor-pointer flex items-end justify-center pb-0.5 ${
                            i < (selectedLog.waterGlasses || 0)
                              ? 'bg-blue-500/30 border-blue-400 text-blue-300'
                              : 'bg-[#18181B] border-zinc-800 text-zinc-700'
                          }`}
                          title={`Glass ${i + 1}`}
                        >
                          <Droplet className="w-2 h-2 fill-current" />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleWaterAdjust(1)}
                      className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-white text-black font-bold flex items-center justify-center text-sm transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Daily Notes & Reflection */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1.5 font-bold">
                  Daily Reflection / Mistakes & Learnings:
                </label>
                <textarea
                  value={selectedLog.notes || ''}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="What concepts clicked today? Any test mistakes to review? Plan for tomorrow..."
                  rows={3}
                  className="w-full p-3 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="mt-6 pt-4 border-t border-[#27272A] flex justify-end">
              <button
                onClick={() => onSelectDay(null)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-black text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
              >
                Close & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

