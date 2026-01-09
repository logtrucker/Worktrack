import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { Clock, ChevronRight, FileText, Share2, Play, Plus, StopCircle } from 'lucide-react';
import { calculateShiftHours } from '../utils/calculations';
import { format, parseISO, isSameDay, parse, differenceInSeconds } from 'date-fns';

interface WorkLogProps {
  groupedShifts: [string, Shift[]][];
  onEdit: (shift: Shift) => void;
  onClockIn: () => void;
  onClockOut: () => void;
  onManualEntry: () => void;
  onImport: () => void;
  onExport: () => void;
  activeClock: { date: string, time: string, timestamp: number } | null;
  onActiveClockEdit: () => void;
}

// Sub-component for the live timer to prevent full WorkLog re-renders
const ActiveShiftRow: React.FC<{ 
    activeClock: { date: string, time: string, timestamp: number }, 
    onStop: (e: React.MouseEvent) => void,
    onClick: () => void 
}> = ({ activeClock, onStop, onClick }) => {
    const [elapsed, setElapsed] = useState('00:00:00');

    useEffect(() => {
        const tick = () => {
            const start = parse(`${activeClock.date} ${activeClock.time}`, 'yyyy-MM-dd HH:mm', new Date());
            const now = new Date();
            const diff = differenceInSeconds(now, start);
            if (diff < 0) {
                setElapsed("00:00:00"); 
                return;
            }
            const h = Math.floor(diff / 3600).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            setElapsed(`${h}:${m}:${s}`);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [activeClock]);

    const dateObj = parseISO(activeClock.date);
    const isTodayDate = isSameDay(dateObj, new Date());

    return (
        <div 
            onClick={onClick}
            className="group flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/20 cursor-pointer transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`flex flex-col items-center leading-none w-10 shrink-0 text-emerald-600 dark:text-emerald-400`}>
                    <span className="text-[10px] font-bold uppercase">{format(dateObj, 'EEE')}</span>
                    <span className="text-lg font-bold">{format(dateObj, 'd')}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-1.5 h-8 rounded-full bg-emerald-500"></div>
                        <div className="absolute top-0 w-1.5 h-8 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                            {activeClock.time} - <span className="text-emerald-500 dark:text-emerald-500">Running...</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Active Shift</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {elapsed}
                </span>
                <button 
                    onClick={onStop}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    aria-label="Clock Out"
                >
                    <StopCircle size={18} />
                </button>
            </div>
        </div>
    );
};

export const WorkLog: React.FC<WorkLogProps> = ({ 
  groupedShifts, 
  onEdit, 
  onClockIn,
  onClockOut,
  onManualEntry, 
  onImport, 
  onExport,
  activeClock,
  onActiveClockEdit
}) => {
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Unified Header & Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    Work History
                </h3>
                <div className="flex gap-1">
                    <button onClick={onImport} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Batch Import">
                        <FileText size={18} />
                    </button>
                    <button onClick={onExport} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Export Period">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                 {!activeClock ? (
                     <button 
                        onClick={onClockIn} 
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
                     >
                        <Play size={18} />
                        Clock In
                     </button>
                 ) : (
                    <button 
                        onClick={onClockOut}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors active:scale-[0.98]"
                    >
                         <StopCircle size={18} />
                         Clock Out
                    </button>
                 )}

                 <button 
                    onClick={onManualEntry}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]"
                 >
                    <Plus size={18} />
                    Add Manual
                 </button>
            </div>
        </div>

        {/* Unified List View */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 min-h-[200px]">
            {activeClock && (
                <ActiveShiftRow 
                    activeClock={activeClock} 
                    onStop={(e) => { e.stopPropagation(); onClockOut(); }}
                    onClick={onActiveClockEdit}
                />
            )}

            {groupedShifts.length === 0 && !activeClock ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                        <Clock size={24} className="opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No saved shifts in this period</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {groupedShifts.map(([date, dayShifts]) => {
                        const isTodayDate = isSameDay(parseISO(date), new Date());
                        const dateObj = parseISO(date);

                        return (
                            <div key={date} className="bg-white dark:bg-slate-900">
                                {dayShifts.map(shift => (
                                    <div 
                                        key={shift.id} 
                                        onClick={() => onEdit(shift)}
                                        className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex flex-col items-center leading-none w-10 shrink-0 ${isTodayDate ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                                                <span className="text-[10px] font-bold uppercase">{format(dateObj, 'EEE')}</span>
                                                <span className="text-lg font-bold">{format(dateObj, 'd')}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className={`w-1 h-8 rounded-full ${isTodayDate ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                                    {shift.startTime} - {shift.endTime}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                                                {calculateShiftHours(shift).toFixed(2)}h
                                            </span>
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};