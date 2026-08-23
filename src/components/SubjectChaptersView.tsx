import React, { useState } from 'react';
import { Chapter, SubjectType } from '../types';
import { calculateChapterProgress, SUBJECT_INFO } from '../utils/calculator';
import { 
  Plus, 
  Search, 
  Check, 
  X, 
  Trash2, 
  FileText, 
  RotateCw, 
  BookOpen, 
  Atom, 
  FlaskConical, 
  Pi
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubjectChaptersViewProps {
  chapters: Chapter[];
  onUpdateChapter: (chapter: Chapter) => void;
  onDeleteChapter: (id: string) => void;
  onOpenAddModal: (defaultSubject?: SubjectType) => void;
}

export const SubjectChaptersView: React.FC<SubjectChaptersViewProps> = ({
  chapters,
  onUpdateChapter,
  onDeleteChapter,
  onOpenAddModal,
}) => {
  const [activeTab, setActiveTab] = useState<SubjectType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Filter chapters by tab and search
  const filteredChapters = chapters.filter((c) => {
    const matchesTab = activeTab === 'all' || c.subject === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const physicsCount = chapters.filter((c) => c.subject === 'physics').length;
  const chemistryCount = chapters.filter((c) => c.subject === 'chemistry').length;
  const mathsCount = chapters.filter((c) => c.subject === 'mathematics').length;

  const handleTriggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#0ea5e9'],
      });
    } catch {
      // Ignore
    }
  };

  const handleLecturesChange = (chapter: Chapter, delta: number) => {
    const nextCompleted = Math.max(0, Math.min(chapter.lecturesTotal, chapter.lecturesCompleted + delta));
    const updated = {
      ...chapter,
      lecturesCompleted: nextCompleted,
      updatedAt: new Date().toISOString(),
    };
    onUpdateChapter(updated);
    if (nextCompleted === chapter.lecturesTotal && chapter.lecturesTotal > 0 && delta > 0) {
      handleTriggerCelebration();
    }
  };

  const handlePyqToggle = (chapter: Chapter) => {
    const nextDone = !chapter.pyqsDone;
    const updated = {
      ...chapter,
      pyqsDone: nextDone,
      updatedAt: new Date().toISOString(),
    };
    onUpdateChapter(updated);
    if (nextDone) handleTriggerCelebration();
  };

  const handlePyqsRatioChange = (chapter: Chapter, delta: number) => {
    const nextCompleted = Math.max(0, Math.min(chapter.pyqsTotal || 999, chapter.pyqsCompleted + delta));
    const updated = {
      ...chapter,
      pyqsCompleted: nextCompleted,
      updatedAt: new Date().toISOString(),
    };
    onUpdateChapter(updated);
  };

  const handleShortNotesToggle = (chapter: Chapter) => {
    const nextVal = !chapter.shortNotes;
    const updated = {
      ...chapter,
      shortNotes: nextVal,
      updatedAt: new Date().toISOString(),
    };
    onUpdateChapter(updated);
    if (nextVal) handleTriggerCelebration();
  };

  const handleRevisionChange = (chapter: Chapter, delta: number) => {
    const nextCount = Math.max(0, chapter.revisionCount + delta);
    const updated = {
      ...chapter,
      revisionCount: nextCount,
      updatedAt: new Date().toISOString(),
    };
    onUpdateChapter(updated);
    if (delta > 0) handleTriggerCelebration();
  };

  const handleSaveNotes = (chapter: Chapter) => {
    onUpdateChapter({
      ...chapter,
      notes: notesText,
      updatedAt: new Date().toISOString(),
    });
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar in Sophisticated Dark */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#18181B] p-3.5 rounded-2xl border border-[#27272A]">
        {/* Subject Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            id="tab-subject-all"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-100 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span>ALL</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#09090B] text-[10px] font-mono text-zinc-400 border border-zinc-800">
              {chapters.length}
            </span>
          </button>

          <button
            id="tab-subject-physics"
            onClick={() => setActiveTab('physics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'physics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-blue-400 hover:bg-zinc-800'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>PHYSICS</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#09090B] text-[10px] font-mono text-zinc-400 border border-zinc-800">
              {physicsCount}
            </span>
          </button>

          <button
            id="tab-subject-chemistry"
            onClick={() => setActiveTab('chemistry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'chemistry'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>CHEMISTRY</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#09090B] text-[10px] font-mono text-zinc-400 border border-zinc-800">
              {chemistryCount}
            </span>
          </button>

          <button
            id="tab-subject-mathematics"
            onClick={() => setActiveTab('mathematics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'mathematics'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
            }`}
          >
            <Pi className="w-3.5 h-3.5" />
            <span>MATHS</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#09090B] text-[10px] font-mono text-zinc-400 border border-zinc-800">
              {mathsCount}
            </span>
          </button>
        </div>

        {/* Search & Add Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chapter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="btn-add-chapter-main"
            onClick={() => onOpenAddModal(activeTab !== 'all' ? activeTab : undefined)}
            className="px-4 py-2 rounded-xl bg-zinc-100 text-black hover:bg-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Chapters Grid / Empty State */}
      {filteredChapters.length === 0 ? (
        <div id="empty-chapters-state" className="text-center py-16 px-6 bg-[#18181B] rounded-2xl border border-dashed border-[#27272A]">
          <div className="w-14 h-14 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center mx-auto mb-4 text-amber-500">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {searchQuery ? 'No matching chapters found' : 'No Chapters Added Yet'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
            {searchQuery
              ? `No chapter matched "${searchQuery}". Try clearing the search filter.`
              : 'Add your first chapter for Physics, Chemistry, or Mathematics. You decide what chapters to add; the app tracks your progress.'}
          </p>
          <button
            id="btn-empty-add-chapter"
            onClick={() => onOpenAddModal(activeTab !== 'all' ? activeTab : undefined)}
            className="px-5 py-2.5 rounded-xl bg-zinc-100 text-black hover:bg-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add First Chapter</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredChapters.map((chapter) => {
            const progress = calculateChapterProgress(chapter);
            const subInfo = SUBJECT_INFO[chapter.subject];
            const isDone = progress >= 90;

            return (
              <div
                key={chapter.id}
                id={`chapter-card-${chapter.id}`}
                className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 transition-all flex flex-col justify-between hover:border-zinc-700"
              >
                {/* Top Badge & Title Row */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        chapter.subject === 'physics'
                          ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                          : chapter.subject === 'chemistry'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      }`}>
                        {subInfo.name}
                      </span>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" /> Complete
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-zinc-400">
                      <button
                        onClick={() => {
                          setEditingNotesId(editingNotesId === chapter.id ? null : chapter.id);
                          setNotesText(chapter.notes || '');
                        }}
                        className={`p-1.5 rounded-lg hover:text-amber-400 hover:bg-zinc-800 transition ${
                          chapter.notes ? 'text-amber-400' : 'text-zinc-500'
                        }`}
                        title="Chapter Notes / Formulae"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete chapter "${chapter.name}"?`)) {
                            onDeleteChapter(chapter.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-zinc-800 transition text-zinc-600"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chapter Name */}
                  <h4 className="text-base font-bold text-white tracking-tight mb-3">
                    {chapter.name}
                  </h4>

                  {/* 4 Dedicated Trackers Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                    {/* 1. Lectures Tracker (completed / total) */}
                    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-2.5 flex flex-col justify-between">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Lectures</div>
                      <div className="flex items-center justify-between gap-1 my-0.5">
                        <button
                          onClick={() => handleLecturesChange(chapter, -1)}
                          className="w-6 h-6 rounded-md bg-[#18181B] hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-90 border border-zinc-800"
                          title="Decrease 1 lecture"
                        >
                          -
                        </button>
                        <div className="font-mono text-xs font-bold text-white text-center">
                          <span className="text-amber-500">{chapter.lecturesCompleted}</span>
                          <span className="text-zinc-600">/</span>
                          <span className="text-zinc-400">{chapter.lecturesTotal}</span>
                        </div>
                        <button
                          onClick={() => handleLecturesChange(chapter, 1)}
                          className="w-6 h-6 rounded-md bg-[#18181B] hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-90 border border-zinc-800"
                          title="Increase 1 lecture"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[9px] text-zinc-500 text-center font-mono">
                        {chapter.lecturesTotal > 0
                          ? `${Math.round((chapter.lecturesCompleted / chapter.lecturesTotal) * 100)}% watched`
                          : 'No total'}
                      </div>
                    </div>

                    {/* 2. PYQs Tracker (Done/Not Done OR ratio) */}
                    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-2.5 flex flex-col justify-between">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1 flex items-center justify-between">
                        <span>PYQs</span>
                        <button
                          onClick={() => {
                            const newMode = chapter.pyqsMode === 'toggle' ? 'ratio' : 'toggle';
                            onUpdateChapter({ ...chapter, pyqsMode: newMode });
                          }}
                          className="text-[9px] text-zinc-500 hover:text-zinc-300 underline"
                          title="Switch between Toggle and Ratio"
                        >
                          {chapter.pyqsMode === 'toggle' ? '1/0' : 'num'}
                        </button>
                      </div>

                      {chapter.pyqsMode === 'toggle' ? (
                        <button
                          onClick={() => handlePyqToggle(chapter)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center gap-1 cursor-pointer ${
                            chapter.pyqsDone
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-[#18181B] text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          {chapter.pyqsDone ? (
                            <>
                              <Check className="w-3 h-3" /> Done
                            </>
                          ) : (
                            'Not Done'
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-1 my-0.5">
                          <button
                            onClick={() => handlePyqsRatioChange(chapter, -5)}
                            className="w-6 h-6 rounded-md bg-[#18181B] hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-90 border border-zinc-800"
                            title="-5 PYQs"
                          >
                            -
                          </button>
                          <div className="font-mono text-xs font-bold text-white text-center">
                            <span className="text-rose-400">{chapter.pyqsCompleted}</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-400">{chapter.pyqsTotal}</span>
                          </div>
                          <button
                            onClick={() => handlePyqsRatioChange(chapter, 5)}
                            className="w-6 h-6 rounded-md bg-[#18181B] hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-90 border border-zinc-800"
                            title="+5 PYQs"
                          >
                            +
                          </button>
                        </div>
                      )}

                      <div className="text-[9px] text-zinc-500 text-center font-mono">
                        {chapter.pyqsMode === 'toggle'
                          ? chapter.pyqsDone
                            ? 'Complete'
                            : 'Pending'
                          : `${chapter.pyqsCompleted} Solved`}
                      </div>
                    </div>

                    {/* 3. Short Notes Tracker (Made / Not Made) */}
                    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-2.5 flex flex-col justify-between">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Short Notes</div>
                      <button
                        onClick={() => handleShortNotesToggle(chapter)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center gap-1 cursor-pointer ${
                          chapter.shortNotes
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-[#18181B] text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {chapter.shortNotes ? (
                          <>
                            <Check className="w-3 h-3" /> Made
                          </>
                        ) : (
                          'Not Made'
                        )}
                      </button>
                      <div className="text-[9px] text-zinc-500 text-center font-mono">
                        {chapter.shortNotes ? 'Ready' : 'Pending'}
                      </div>
                    </div>

                    {/* 4. Revision Count (0×, 1×, 2×...) */}
                    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-2.5 flex flex-col justify-between">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Revision</div>
                      <div className="flex items-center justify-between gap-1 my-0.5">
                        <button
                          onClick={() => handleRevisionChange(chapter, -1)}
                          className="w-6 h-6 rounded-md bg-[#18181B] hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-90 border border-zinc-800"
                          title="-1 Revision"
                        >
                          -
                        </button>
                        <div className="font-mono text-sm font-bold text-blue-400 text-center">
                          {chapter.revisionCount}×
                        </div>
                        <button
                          onClick={() => handleRevisionChange(chapter, 1)}
                          className="w-6 h-6 rounded-md bg-[#18181B] hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-90 border border-zinc-800"
                          title="+1 Revision"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[9px] text-zinc-500 text-center font-mono">
                        {chapter.revisionCount === 0
                          ? '0 Rev'
                          : `${chapter.revisionCount} Cycle${chapter.revisionCount > 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>

                  {/* Notes Dropdown Field if active */}
                  {editingNotesId === chapter.id && (
                    <div className="mb-4 bg-[#09090B] p-3 rounded-xl border border-[#27272A]">
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">
                        Chapter Notes, Weak Concepts or Key Formulae:
                      </label>
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="e.g. Focus on rotational inertia theorems, do 2024 shift 2 PYQs..."
                        rows={2}
                        className="w-full p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-medium"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(chapter)}
                          className="px-3 py-1 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {chapter.notes && editingNotesId !== chapter.id && (
                    <div 
                      onClick={() => {
                        setEditingNotesId(chapter.id);
                        setNotesText(chapter.notes || '');
                      }}
                      className="mb-3 px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-zinc-300 italic cursor-pointer hover:border-zinc-700 transition"
                    >
                      "{chapter.notes}"
                    </div>
                  )}
                </div>

                {/* Chapter Progress Bar */}
                <div className="pt-3 border-t border-[#27272A]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Mastery</span>
                    <span className={`font-bold ${isDone ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

