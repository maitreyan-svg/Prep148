import React, { useState } from 'react';
import { Chapter, SubjectType } from '../types';
import { X, Plus, Atom, FlaskConical, Pi, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChapter: (chapter: Chapter) => void;
  defaultSubject?: SubjectType;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  onClose,
  onAddChapter,
  defaultSubject = 'physics',
}) => {
  const [subject, setSubject] = useState<SubjectType>(defaultSubject);
  const [name, setName] = useState('');
  const [lecturesTotal, setLecturesTotal] = useState('10');
  const [lecturesCompleted, setLecturesCompleted] = useState('0');
  const [pyqsMode, setPyqsMode] = useState<'toggle' | 'ratio'>('toggle');
  const [pyqsTotal, setPyqsTotal] = useState('50');
  const [pyqsCompleted, setPyqsCompleted] = useState('0');
  const [pyqsDone, setPyqsDone] = useState(false);
  const [shortNotes, setShortNotes] = useState(false);
  const [revisionCount, setRevisionCount] = useState(0);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newChapter: Chapter = {
      id: 'ch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      subject,
      lecturesTotal: Math.max(0, parseInt(lecturesTotal, 10) || 0),
      lecturesCompleted: Math.max(0, parseInt(lecturesCompleted, 10) || 0),
      pyqsMode,
      pyqsTotal: Math.max(0, parseInt(pyqsTotal, 10) || 0),
      pyqsCompleted: Math.max(0, parseInt(pyqsCompleted, 10) || 0),
      pyqsDone,
      shortNotes,
      revisionCount: Math.max(0, revisionCount),
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddChapter(newChapter);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#0ea5e9'],
      });
    } catch {
      // ignore
    }

    // Reset & close
    setName('');
    setNotes('');
    onClose();
  };

  return (
    <div 
      id="add-chapter-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#18181B] border border-[#27272A] rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#09090B] text-amber-500 border border-[#27272A]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add New Chapter</h3>
              <p className="text-xs text-zinc-400">Configure trackers for JEE Main 2027</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#09090B] hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer border border-[#27272A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Subject Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1.5 font-bold">
              Subject:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSubject('physics')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  subject === 'physics'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <Atom className="w-4 h-4" />
                <span>Physics</span>
              </button>

              <button
                type="button"
                onClick={() => setSubject('chemistry')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  subject === 'chemistry'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Chemistry</span>
              </button>

              <button
                type="button"
                onClick={() => setSubject('mathematics')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  subject === 'mathematics'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <Pi className="w-4 h-4" />
                <span>Maths</span>
              </button>
            </div>
          </div>

          {/* Chapter Name */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1.5 font-bold">
              Chapter Title / Topic:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rotational Dynamics, Chemical Bonding, Definite Integration..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Lectures Tracker Init */}
          <div className="grid grid-cols-2 gap-3 bg-[#09090B] p-3 rounded-2xl border border-[#27272A]">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">
                Lectures Done:
              </label>
              <input
                type="number"
                min={0}
                value={lecturesCompleted}
                onChange={(e) => setLecturesCompleted(e.target.value)}
                className="w-full p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono text-white text-center"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">
                Total Lectures:
              </label>
              <input
                type="number"
                min={0}
                value={lecturesTotal}
                onChange={(e) => setLecturesTotal(e.target.value)}
                className="w-full p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono text-white text-center"
              />
            </div>
          </div>

          {/* PYQs Mode & Init */}
          <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                PYQs Mode:
              </label>
              <div className="flex bg-[#18181B] p-0.5 rounded-lg border border-[#27272A] text-xs">
                <button
                  type="button"
                  onClick={() => setPyqsMode('toggle')}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] cursor-pointer ${
                    pyqsMode === 'toggle' ? 'bg-zinc-100 text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  Done / Not Done
                </button>
                <button
                  type="button"
                  onClick={() => setPyqsMode('ratio')}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] cursor-pointer ${
                    pyqsMode === 'ratio' ? 'bg-zinc-100 text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  Completed / Total
                </button>
              </div>
            </div>

            {pyqsMode === 'toggle' ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-300 font-mono">Initial PYQ Status:</span>
                <button
                  type="button"
                  onClick={() => setPyqsDone(!pyqsDone)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                    pyqsDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#18181B] text-zinc-400 border border-[#27272A]'
                  }`}
                >
                  {pyqsDone ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
                    </>
                  ) : (
                    'Not Done'
                  )}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Solved:</label>
                  <input
                    type="number"
                    min={0}
                    value={pyqsCompleted}
                    onChange={(e) => setPyqsCompleted(e.target.value)}
                    className="w-full p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Target:</label>
                  <input
                    type="number"
                    min={0}
                    value={pyqsTotal}
                    onChange={(e) => setPyqsTotal(e.target.value)}
                    className="w-full p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono text-white text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Short Notes & Revisions */}
          <div className="grid grid-cols-2 gap-3">
            {/* Short Notes */}
            <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] flex flex-col justify-between">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-2 font-bold">
                Short Notes:
              </label>
              <button
                type="button"
                onClick={() => setShortNotes(!shortNotes)}
                className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  shortNotes
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-[#18181B] text-zinc-400 border border-[#27272A]'
                }`}
              >
                {shortNotes ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Made
                  </>
                ) : (
                  'Not Made'
                )}
              </button>
            </div>

            {/* Revisions Count */}
            <div className="bg-[#09090B] p-3 rounded-2xl border border-[#27272A] flex flex-col justify-between">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-2 font-bold">
                Initial Revision:
              </label>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setRevisionCount(Math.max(0, revisionCount - 1))}
                  className="w-7 h-7 rounded-lg bg-[#18181B] text-zinc-300 flex items-center justify-center font-bold border border-[#27272A] cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-blue-400">{revisionCount}×</span>
                <button
                  type="button"
                  onClick={() => setRevisionCount(revisionCount + 1)}
                  className="w-7 h-7 rounded-lg bg-[#18181B] text-zinc-300 flex items-center justify-center font-bold border border-[#27272A] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Submit */}
          <div className="pt-3 border-t border-[#27272A] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#09090B] hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-bold rounded-xl transition cursor-pointer border border-[#27272A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-black text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition active:scale-95 shadow-sm cursor-pointer"
            >
              + Create Chapter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

