import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Check } from 'lucide-react';
import { Shift } from '../../types';
import { isValid, parse, format } from 'date-fns';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (shifts: Omit<Shift, 'id'>[]) => void;
}

const SEPARATORS = [
    { label: 'Comma (,)', value: ',' },
    { label: 'Tab', value: '\t' },
    { label: 'Space', value: ' ' },
    { label: 'Semicolon (;)', value: ';' },
];

const COLUMNS = [
    { label: 'Date', value: 'date' },
    { label: 'Start Time', value: 'start' },
    { label: 'End Time', value: 'end' },
    { label: 'Ignore', value: 'ignore' },
];

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [importText, setImportText] = useState('');
  const [separator, setSeparator] = useState(',');
  const [columnOrder, setColumnOrder] = useState<string[]>(['date', 'start', 'end']);
  const [parsedShifts, setParsedShifts] = useState<Omit<Shift, 'id'>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Auto-parse when inputs change (Manual/CSV mode)
  useEffect(() => {
    if (!importText.trim()) {
      setParsedShifts([]);
      setParseError(null);
      return;
    }
    
    const lines = importText.trim().split('\n');
    const results: Omit<Shift, 'id'>[] = [];
    let errorCount = 0;

    // Regex for "Share Format": Mon, Oct 24: 08:00 - 17:00 (8.00h)
    const shareRegex = /^([a-zA-Z]+, [a-zA-Z]+ \d+):\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;

    for (const line of lines) {
        if (!line.trim()) continue;
        
        let shiftFound = false;

        const match = line.match(shareRegex);
        if (match) {
            try {
                const datePart = match[1];
                const startStr = match[2];
                const endStr = match[3];
                // Assume current year if missing in the "Mon, Oct 24" format
                const currentYear = new Date().getFullYear();
                const parsedDate = parse(`${datePart} ${currentYear}`, 'EEE, MMM d yyyy', new Date());
                
                if (isValid(parsedDate)) {
                    results.push({
                        date: format(parsedDate, 'yyyy-MM-dd'),
                        startTime: startStr.padStart(5, '0'),
                        endTime: endStr.padStart(5, '0')
                    });
                    shiftFound = true;
                }
            } catch (e) {}
        }

        if (!shiftFound) {
            const parts = line.split(separator).map(p => p.trim());
            let dateStr = '', startStr = '', endStr = '';

            columnOrder.forEach((colType, index) => {
                if (parts[index]) {
                    if (colType === 'date') dateStr = parts[index];
                    if (colType === 'start') startStr = parts[index];
                    if (colType === 'end') endStr = parts[index];
                }
            });

            try {
                const date = new Date(dateStr);
                if (isValid(date) && startStr && endStr) {
                    const normalizeTime = (t: string) => {
                        if (!t) return '';
                        // Basic normalization for times like 800 or 1700
                        if (t.length === 4 && !t.includes(':')) return `${t.slice(0,2)}:${t.slice(2)}`;
                        // Normalization for H:mm to HH:mm
                        if (t.includes(':') && t.split(':')[0].length === 1) return `0${t}`;
                        return t;
                    };
                    results.push({
                        date: format(date, 'yyyy-MM-dd'),
                        startTime: normalizeTime(startStr),
                        endTime: normalizeTime(endStr)
                    });
                    shiftFound = true;
                }
            } catch (e) {}
        }

        if (!shiftFound) errorCount++;
    }

    setParsedShifts(results);
    if (results.length === 0 && lines.length > 0) {
        setParseError("No shifts detected. Ensure the format matches your CSV settings.");
    } else if (errorCount > 0) {
        setParseError(`Detected ${results.length} shifts. Skipped ${errorCount} lines.`);
    } else {
        setParseError(null);
    }

  }, [importText, separator, columnOrder]);

  const handleImport = () => {
    if (parsedShifts.length > 0) {
        onImport(parsedShifts);
        onClose();
        setImportText('');
        setParsedShifts([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-2 text-indigo-600">
                        <FileText size={24} />
                        <h3 className="text-lg font-bold">Batch Import</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-1">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-sm text-indigo-800 dark:text-indigo-200">
                    <p className="font-bold mb-1">How it works:</p>
                    <p className="opacity-90 text-xs">Paste your work history below. Use standard CSV format and select the correct separator and column mapping.</p>
                </div>

                <div className="space-y-2 relative">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Input Text</label>
                    </div>
                    <textarea 
                        className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-xs transition-all"
                        placeholder={`Paste shifts here...\nExample: 2024-10-24, 08:00, 17:00`}
                        value={importText}
                        onChange={e => setImportText(e.target.value)}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">CSV Separator</label>
                        <select 
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none"
                            value={separator}
                            onChange={e => setSeparator(e.target.value)}
                        >
                            {SEPARATORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Column Map</label>
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <select 
                                    key={i} 
                                    className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] outline-none"
                                    value={columnOrder[i] || 'ignore'}
                                    onChange={e => {
                                        const newOrder = [...columnOrder];
                                        newOrder[i] = e.target.value;
                                        setColumnOrder(newOrder);
                                    }}
                                >
                                    {COLUMNS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Extraction Results ({parsedShifts.length})</label>
                        {parseError && <span className="text-[10px] text-orange-500 font-medium flex items-center gap-1 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-md"><AlertCircle size={10}/> {parseError}</span>}
                     </div>
                     
                     <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 h-40 overflow-y-auto p-2 relative">
                        {parsedShifts.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                                Results will appear here...
                            </div>
                        ) : (
                            <table className="w-full text-[11px] text-left">
                                <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-950 z-10">
                                    <tr>
                                        <th className="pb-2 pl-2">Date</th>
                                        <th className="pb-2">Start</th>
                                        <th className="pb-2">End</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {parsedShifts.map((s, i) => (
                                        <tr key={i} className="text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                                            <td className="py-2 pl-2 font-medium">{s.date}</td>
                                            <td className="py-2 font-mono">{s.startTime}</td>
                                            <td className="py-2 font-mono">{s.endTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                     </div>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button 
                    onClick={handleImport} 
                    disabled={parsedShifts.length === 0}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 transition-all active:scale-[0.98]"
                >
                    Import {parsedShifts.length} Shifts
                </button>
            </div>
        </div>
    </div>
  );
};