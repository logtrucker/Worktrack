import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Shift, AppSettings, ThemeMode } from './types';
import { calculateWeeklyStats } from './utils/calculations';
import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  addWeeks, 
  subWeeks, 
} from 'date-fns';

// Components
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { WorkLog } from './components/WorkLog';

// Modals
import { ShiftFormModal } from './components/modals/ShiftFormModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ImportModal } from './components/modals/ImportModal';
import { ShareModal } from './components/modals/ShareModal';
import { ActiveClockEditModal } from './components/modals/ActiveClockEditModal';

const App: React.FC = () => {
  const STORAGE_KEY_SHIFTS = 'wt_shifts_v1';
  const STORAGE_KEY_SETTINGS = 'wt_settings_v1';
  const STORAGE_KEY_ACTIVE_CLOCK = 'wt_active_clock_v1';

  // --- State ---
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHIFTS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const defaultSettings: AppSettings = {
      companyName: '',
      hourlyRate: 0,
      overtimeThreshold: 40, 
      isFlsaExempt: false,
      overtimeMultiplier: 1.5,
      weekStartDay: 0, // Sunday
      minWeeklyGuarantee: 0,
      themeMode: 'light',
      darkScheduleStart: '19:00',
      darkScheduleEnd: '07:00',
      taxSettings: {
        filingStatus: 'single',
        stateCode: 'GA',
        stateTaxRate: 5.49,
        useStandardDeduction: true,
        customDeduction: 0,
        includeFica: true,
        additionalWithholding: 0,
        is1099: false
      }
    };
    
    if (saved) {
        const parsed = JSON.parse(saved);
        return { 
            ...defaultSettings, 
            ...parsed, 
            taxSettings: { 
                ...defaultSettings.taxSettings, 
                ...(parsed.taxSettings || {}) 
            } 
        };
    }
    return defaultSettings;
  });

  const [activeClockIn, setActiveClockIn] = useState<{ date: string, time: string, timestamp: number } | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_CLOCK);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeDate, setActiveDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  
  // Modal States
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showActiveClockEdit, setShowActiveClockEdit] = useState(false);

  // --- Theme Resolution ---
  const resolvedTheme = useMemo((): 'light' | 'dark' | 'night-vision' => {
    if (settings.themeMode === 'light') return 'light';
    if (settings.themeMode === 'dark') return 'dark';
    if (settings.themeMode === 'nightVision') return 'night-vision';
    
    if (settings.themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (settings.themeMode === 'scheduled') {
      const nowStr = format(now, 'HH:mm');
      const start = settings.darkScheduleStart;
      const end = settings.darkScheduleEnd;
      
      if (start < end) {
        return (nowStr >= start && nowStr < end) ? 'dark' : 'light';
      } else {
        return (nowStr >= start || nowStr < end) ? 'dark' : 'light';
      }
    }
    
    return 'light';
  }, [settings.themeMode, settings.darkScheduleStart, settings.darkScheduleEnd, now]);

  // --- Effects ---
  useEffect(() => localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(shifts)), [shifts]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_ACTIVE_CLOCK, JSON.stringify(activeClockIn)), [activeClockIn]);
  
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'night-vision');
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (resolvedTheme === 'night-vision') {
      document.documentElement.classList.add('night-vision');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000); 
    return () => clearInterval(interval);
  }, []);

  // --- Derived State ---
  const weekStart = startOfWeek(activeDate, { weekStartsOn: settings.weekStartDay as any });
  const weekEnd = endOfWeek(activeDate, { weekStartsOn: settings.weekStartDay as any });
  const weekRangeLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const visibleShifts = useMemo(() => {
    return shifts.filter(s => isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd }));
  }, [shifts, weekStart, weekEnd]);

  const activeClockInThisWeek = useMemo(() => {
    if (!activeClockIn) return false;
    const date = parseISO(activeClockIn.date);
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  }, [activeClockIn, weekStart, weekEnd]);

  const stats = useMemo(() => {
      let shiftsToCalc = [...visibleShifts];
      if (activeClockIn && activeClockInThisWeek) {
          const tempShift: Shift = {
              id: 'temp-active',
              date: activeClockIn.date,
              startTime: activeClockIn.time,
              endTime: format(now, 'HH:mm')
          };
          shiftsToCalc.push(tempShift);
      }
      return calculateWeeklyStats(shiftsToCalc, settings);
  }, [visibleShifts, settings, activeClockIn, now, activeClockInThisWeek]);

  const groupedShifts = useMemo(() => {
    const groups: { [key: string]: Shift[] } = {};
    visibleShifts.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [visibleShifts]);

  // --- Handlers ---
  const toggleTheme = () => {
      let nextMode: ThemeMode;
      if (resolvedTheme === 'light') {
        nextMode = 'dark';
      } else if (resolvedTheme === 'dark') {
        nextMode = 'nightVision';
      } else {
        nextMode = 'light';
      }
      setSettings(prev => ({ ...prev, themeMode: nextMode }));
  };

  const handleClockIn = () => {
      const d = new Date();
      setActiveClockIn({
        date: format(d, 'yyyy-MM-dd'),
        time: format(d, 'HH:mm'),
        timestamp: Date.now()
      });
      setNow(d);
  };

  const handleClockOut = () => {
    if (activeClockIn) {
      const end = new Date();
      const newShift: Shift = {
        id: crypto.randomUUID(),
        date: activeClockIn.date,
        startTime: activeClockIn.time,
        endTime: format(end, 'HH:mm')
      };
      setShifts(prev => [...prev, newShift]);
      setActiveClockIn(null);
    }
  };

  const handleUpdateActiveClock = (date: string, time: string) => {
      if (activeClockIn) {
          setActiveClockIn({ ...activeClockIn, date, time });
          setShowActiveClockEdit(false);
      }
  };

  const handleSaveShift = (shift: Omit<Shift, 'id'> | Shift) => {
    if ('id' in shift) {
      setShifts(prev => prev.map(s => s.id === shift.id ? shift as Shift : s));
    } else {
      setShifts(prev => [...prev, { ...shift, id: crypto.randomUUID() }]);
    }
  };

  const handleDeleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const handleImportShifts = (newShifts: Omit<Shift, 'id'>[]) => {
      const shiftsWithIds = newShifts.map(s => ({ ...s, id: crypto.randomUUID() }));
      setShifts(prev => [...prev, ...shiftsWithIds]);
  };

  const openEdit = (s: Shift) => {
    setEditingShift(s);
    setShowShiftForm(true);
  };

  const openAdd = () => {
    setEditingShift(null);
    setShowShiftForm(true);
  };

  return (
      <div className="min-h-screen pb-20 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 transition-colors duration-200">
        <Header 
            companyName={settings.companyName} 
            theme={resolvedTheme} 
            toggleTheme={toggleTheme} 
            onSettingsClick={() => setShowSettings(true)} 
        />
        <main className="max-w-xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <button onClick={() => setActiveDate(prev => subWeeks(prev, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold tracking-tight">{weekRangeLabel}</span>
                </div>
                <button onClick={() => setActiveDate(prev => addWeeks(prev, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            <StatsCard stats={stats} settings={settings} />
            
            <WorkLog 
                groupedShifts={groupedShifts}
                onEdit={openEdit}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                onManualEntry={openAdd}
                onImport={() => setShowImportModal(true)}
                onExport={() => setShowShareModal(true)}
                activeClock={activeClockInThisWeek ? activeClockIn : null}
                onActiveClockEdit={() => setShowActiveClockEdit(true)}
            />
        </main>

        <ShiftFormModal 
            isOpen={showShiftForm} 
            onClose={() => setShowShiftForm(false)} 
            editingShift={editingShift}
            shifts={shifts}
            onSave={handleSaveShift}
            onDelete={handleDeleteShift}
            initialDate={activeDate}
        />
        <ActiveClockEditModal
          isOpen={showActiveClockEdit}
          onClose={() => setShowActiveClockEdit(false)}
          currentClock={activeClockIn}
          onSave={handleUpdateActiveClock}
        />
        <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
            settings={settings}
            onUpdate={setSettings}
        />
        <ImportModal 
            isOpen={showImportModal} 
            onClose={() => setShowImportModal(false)} 
            onImport={handleImportShifts}
        />
        <ShareModal 
            isOpen={showShareModal} 
            onClose={() => setShowShareModal(false)} 
            shifts={visibleShifts}
            settings={settings}
            stats={stats}
            activeClock={activeClockInThisWeek ? activeClockIn : null}
        />
      </div>
  );
};

export default App;