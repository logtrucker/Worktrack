import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { differenceInSeconds, parse } from 'date-fns';

interface ActiveClockCardProps {
  activeClockIn: { date: string, time: string, timestamp: number };
  onStop: () => void;
  onEdit: () => void;
}

export const ActiveClockCard: React.FC<ActiveClockCardProps> = ({ activeClockIn, onStop, onEdit }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const tick = () => {
      const start = parse(`${activeClockIn.date} ${activeClockIn.time}`, 'yyyy-MM-dd HH:mm', new Date());
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
  }, [activeClockIn]);

  return (
     <div className="material-card bg-emerald-500 text-white p-5 shadow-lg shadow-emerald-200 dark:shadow-none relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/20 rounded-full animate-pulse">
                     <Timer size={24} />
                 </div>
                 <div>
                     <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-0.5">Currently Working</div>
                     <div className="font-mono text-3xl font-bold tabular-nums">{elapsed}</div>
                     <div className="text-xs text-emerald-100 opacity-80 mt-0.5">Started at {activeClockIn.time}</div>
                 </div>
            </div>
            <div className="flex flex-col gap-2">
                <button 
                    onClick={onStop} 
                    className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-50 transition-colors"
                >
                    Stop
                </button>
                <button 
                    onClick={onEdit}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-medium transition-colors"
                >
                    Edit Start
                </button>
            </div>
        </div>
     </div>
  );
};