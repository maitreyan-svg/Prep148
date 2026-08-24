import React, { useState } from 'react';
import { exportAllData, importAllData } from '../utils/storage';
import { X, Download, Upload, Check, AlertTriangle, FileJson } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: () => void;
  onImportSuccess?: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
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

    const res = importAllData(importJson);
    if (res) {
      setStatusMsg({ type: 'success', text: 'Data imported successfully!' });
      if (onImportSuccess) onImportSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setStatusMsg({ type: 'error', text: 'Failed to parse JSON. Please check formatting.' });
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
              <p className="text-xs text-zinc-400">Export or restore your 148-day mission records</p>
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
          <div className="bg-[#09090B] p-4 rounded-2xl border border-[#27272A]">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-500" />
              <span>Export JSON Snapshot</span>
            </h4>
            <p className="text-xs text-zinc-400 mb-3">
              Download your complete syllabus, chapters, and 148-day study logs as a secure JSON snapshot.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Mission Backup (.json)</span>
            </button>
          </div>

          {/* Import section */}
          <div className="bg-[#09090B] p-4 rounded-2xl border border-[#27272A]">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Restore from Backup</span>
            </h4>
            <p className="text-xs text-zinc-400 mb-2">
              Paste valid JSON backup text to restore your target and progress data.
            </p>
            <textarea
              rows={3}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='Paste {"appName":"JEE Mission 148", ...} here...'
              className="w-full bg-[#18181B] border border-[#27272A] rounded-xl p-3 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 mb-3 resize-none"
            />
            <button
              onClick={handleImport}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-emerald-500/30 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Restore Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
