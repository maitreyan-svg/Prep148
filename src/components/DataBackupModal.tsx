import React, { useState } from 'react';
import { ProfileType } from '../types';
import { exportAllData, importAllData, resetProfileData } from '../utils/storage';
import { X, Download, Upload, RotateCcw, Check, AlertTriangle, FileJson } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ProfileType;
  onDataChanged: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onDataChanged,
}) => {
  const [importJson, setImportJson] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JEE_Mission_148_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'Backup downloaded successfully!' });
  };

  const handleImport = () => {
    if (!importJson.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste valid JSON data.' });
      return;
    }

    const ok = importAllData(importJson);
    if (ok) {
      setStatusMsg({ type: 'success', text: 'Data imported successfully!' });
      onDataChanged();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: 'Failed to parse JSON. Please check formatting.' });
    }
  };

  const handleReset = () => {
    if (window.confirm(`Reset ${activeProfile.toUpperCase()}'s data back to 0% progress and empty chapters?`)) {
      resetProfileData(activeProfile);
      setStatusMsg({ type: 'success', text: `${activeProfile.toUpperCase()} profile reset to empty state.` });
      onDataChanged();
    }
  };

  return (
    <div 
      id="backup-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#18181B] border border-[#27272A] rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#09090B] text-amber-500 border border-[#27272A]">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Data Management & Backup</h3>
              <p className="text-xs text-zinc-400">Export or restore Nibir & Maitreyan mission records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#09090B] hover:bg-zinc-800 text-zinc-400 hover:text-white transition border border-[#27272A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Export section */}
          <div className="bg-[#09090B] p-4 rounded-2xl border border-[#27272A] flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Export All Data</h4>
              <p className="text-xs text-zinc-400">Save both Nibir and Maitreyan profiles as a .json backup file</p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-black rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Import section */}
          <div className="bg-[#09090B] p-4 rounded-2xl border border-[#27272A] space-y-3">
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Import / Restore Backup</h4>
              <p className="text-xs text-zinc-400">Paste JSON content below to restore all mission tracking data</p>
            </div>

            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste exported JSON here..."
              rows={3}
              className="w-full p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />

            <div className="flex justify-end">
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Data</span>
              </button>
            </div>
          </div>

          {/* Reset profile */}
          <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset {activeProfile.toUpperCase()} (Start Clean)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#09090B] hover:bg-zinc-800 text-white rounded-xl text-xs font-mono font-bold border border-[#27272A] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

