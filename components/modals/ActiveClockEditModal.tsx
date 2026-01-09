import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar } from 'lucide-react';

interface ActiveClockEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClock: { date: string, time: string } | null;
  onSave: (date: string, time: string) => void;
}

export const ActiveClockEditModal: React.FC<ActiveClockEditModalProps> = ({ isOpen, onClose, currentClock, onSave }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (currentClock) {
      setDate(currentClock.date);
      setTime(currentClock.time);
    }
  }, [currentClock, isOpen]);

  if (!isOpen || !currentClock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Edit Active Session</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                        <Calendar size={12} /> Start Date
                    </label>
                    <input 
                        type="date" 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                        <Clock size={12} /> Start Time
                    </label>
                    <input 
                        type="time" 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                        value={time} 
                        onChange={e => setTime(e.target.value)} 
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                    Cancel
                </button>
                <button 
                  onClick={() => onSave(date, time)} 
                  className="flex-1 py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                    Update
                </button>
            </div>
        </div>
    </div>
  );
};