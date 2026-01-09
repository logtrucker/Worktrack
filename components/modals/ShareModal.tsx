import React from 'react';
import { X, ClipboardList, Wallet } from 'lucide-react';
import { Shift, AppSettings, ShiftStats } from '../../types';
import { generateShareText, generateDetailedShareText } from '../../utils/calculations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  settings: AppSettings;
  stats: ShiftStats;
  activeClock?: { date: string, time: string } | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shifts, settings, stats, activeClock }) => {
  const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        // Optional: Show success toast
    } catch (err) {
        console.error("Failed to copy", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Share Report</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                    <button 
                    onClick={() => copyToClipboard(generateShareText(shifts, settings, stats, activeClock))}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all text-left group"
                    >
                        <div className="mb-2 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <ClipboardList size={20} />
                        </div>
                        <div className="font-bold text-sm">Simple List</div>
                        <div className="text-xs text-slate-500">Dates and hours only</div>
                    </button>
                    <button 
                    onClick={() => copyToClipboard(generateDetailedShareText(shifts, settings, stats, activeClock))}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 transition-all text-left group"
                    >
                        <div className="mb-2 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <Wallet size={20} />
                        </div>
                        <div className="font-bold text-sm">Detailed Report</div>
                        <div className="text-xs text-slate-500">Includes pay & tax estimates</div>
                    </button>
            </div>
        </div>
    </div>
  );
};