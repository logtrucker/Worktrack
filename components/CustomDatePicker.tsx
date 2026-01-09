import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { Shift } from '../types';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  shifts: Shift[];
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, shifts }) => {
  const [currentMonth, setCurrentMonth] = useState(parseISO(value));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const hasShift = (day: Date) => shifts.some(s => isSameDay(parseISO(s.date), day));
  const isSelected = (day: Date) => isSameDay(parseISO(value), day);

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  useEffect(() => {
    if (!isSameMonth(parseISO(value), currentMonth)) {
      setCurrentMonth(parseISO(value));
    }
  }, [value, currentMonth]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full shadow-sm text-slate-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{format(currentMonth, 'MMMM yyyy')}</span>
        <button type="button" onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full shadow-sm text-slate-500 transition-colors"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center mb-2">
        {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const selected = isSelected(day);
            const shift = hasShift(day);
            return (
                <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => onChange(format(day, 'yyyy-MM-dd'))}
                    className={`
                        h-9 w-9 rounded-full flex flex-col items-center justify-center text-xs relative transition-all
                        ${selected ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 dark:shadow-none' : 'hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}
                        ${!isCurrentMonth ? 'opacity-30' : ''}
                        ${isToday(day) && !selected ? 'text-indigo-600 font-bold ring-1 ring-indigo-200 dark:ring-indigo-900' : ''}
                    `}
                >
                    <span className="z-10">{format(day, 'd')}</span>
                    {shift && (
                      <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${selected ? 'bg-indigo-300' : 'bg-indigo-500'}`}></span>
                    )}
                </button>
            )
        })}
      </div>
    </div>
  )
};