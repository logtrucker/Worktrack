import React, { useState } from 'react';
import { X, Briefcase, RefreshCcw, Trash2, Moon, Sun, Monitor, Clock, EyeOff } from 'lucide-react';
import { AppSettings, FilingStatus, StateCode, ThemeMode } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const FILING_STATUSES: { label: string, value: FilingStatus }[] = [
    { label: 'Single', value: 'single' },
    { label: 'Married Filing Jointly', value: 'mfj' },
    { label: 'Married Filing Separately', value: 'mfs' },
    { label: 'Head of Household', value: 'hoh' },
  ];
  
const STATES: { label: string, value: StateCode }[] = [
    { label: 'Alabama (AL)', value: 'AL' }, { label: 'Alaska (AK)', value: 'AK' }, { label: 'Arizona (AZ)', value: 'AZ' },
    { label: 'Arkansas (AR)', value: 'AR' }, { label: 'California (CA)', value: 'CA' }, { label: 'Colorado (CO)', value: 'CO' },
    { label: 'Connecticut (CT)', value: 'CT' }, { label: 'Delaware (DE)', value: 'DE' }, { label: 'Dist. of Columbia (DC)', value: 'DC' },
    { label: 'Florida (FL)', value: 'FL' }, { label: 'Georgia (GA)', value: 'GA' }, { label: 'Hawaii (HI)', value: 'HI' },
    { label: 'Idaho (ID)', value: 'ID' }, { label: 'Illinois (IL)', value: 'IL' }, { label: 'Indiana (IN)', value: 'IN' },
    { label: 'Iowa (IA)', value: 'IA' }, { label: 'Kansas (KS)', value: 'KS' }, { label: 'Kentucky (KY)', value: 'KY' },
    { label: 'Louisiana (LA)', value: 'LA' }, { label: 'Maine (ME)', value: 'ME' }, { label: 'Maryland (MD)', value: 'MD' },
    { label: 'Massachusetts (MA)', value: 'MA' }, { label: 'Michigan (MI)', value: 'MI' }, { label: 'Minnesota (MN)', value: 'MN' },
    { label: 'Mississippi (MS)', value: 'MS' }, { label: 'Missouri (MO)', value: 'MO' }, { label: 'Montana (MT)', value: 'MT' },
    { label: 'Nebraska (NE)', value: 'NE' }, { label: 'Nevada (NV)', value: 'NV' }, { label: 'New Hampshire (NH)', value: 'NH' },
    { label: 'New Jersey (NJ)', value: 'NJ' }, { label: 'New Mexico (NM)', value: 'NM' }, { label: 'New York (NY)', value: 'NY' },
    { label: 'North Carolina (NC)', value: 'NC' }, { label: 'North Dakota (ND)', value: 'ND' }, { label: 'Ohio (OH)', value: 'OH' },
    { label: 'Oklahoma (OK)', value: 'OK' }, { label: 'Oregon (OR)', value: 'OR' }, { label: 'Pennsylvania (PA)', value: 'PA' },
    { label: 'Rhode Island (RI)', value: 'RI' }, { label: 'South Carolina (SC)', value: 'SC' }, { label: 'South Dakota (SD)', value: 'SD' },
    { label: 'Tennessee (TN)', value: 'TN' }, { label: 'Texas (TX)', value: 'TX' }, { label: 'Utah (UT)', value: 'UT' },
    { label: 'Vermont (VT)', value: 'VT' }, { label: 'Virginia (VA)', value: 'VA' }, { label: 'Washington (WA)', value: 'WA' },
    { label: 'West Virginia (WV)', value: 'WV' }, { label: 'Wisconsin (WI)', value: 'WI' }, { label: 'Wyoming (WY)', value: 'WY' },
    { label: 'Federal Only (No State)', value: 'NONE' },
    { label: 'Custom Flat Rate', value: 'CUSTOM' },
];

const DAYS_OF_WEEK = [
    { label: 'Sunday', value: 0 }, { label: 'Monday', value: 1 }, { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 }, { label: 'Thursday', value: 4 }, { label: 'Friday', value: 5 }, { label: 'Saturday', value: 6 },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'tax' | 'appearance'>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <h3 className="font-bold text-lg">App Settings</h3>
                <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
                <button 
                  onClick={() => setActiveTab('general')} 
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  General
                </button>
                <button 
                  onClick={() => setActiveTab('appearance')} 
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Appearance
                </button>
                <button 
                  onClick={() => setActiveTab('tax')} 
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tax' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Tax
                </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 flex-1">
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Company / Project Name</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                              value={settings.companyName} 
                              onChange={e => onUpdate({...settings, companyName: e.target.value})} 
                              placeholder="e.g. Acme Corp" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hourly Base Rate</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-4 text-slate-400 font-bold">$</span>
                                    <input 
                                      type="number" 
                                      className="w-full p-4 pl-9 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" 
                                      value={settings.hourlyRate} 
                                      onChange={e => onUpdate({...settings, hourlyRate: Number(e.target.value)})} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">OT Multiplier</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-4 text-slate-400 font-bold">×</span>
                                    <input 
                                      type="number" 
                                      step="0.1" 
                                      className="w-full p-4 pl-9 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" 
                                      value={settings.overtimeMultiplier} 
                                      onChange={e => onUpdate({...settings, overtimeMultiplier: Number(e.target.value)})} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">OT After (Hrs/Wk)</label>
                                <input 
                                  type="number" 
                                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" 
                                  value={settings.overtimeThreshold} 
                                  onChange={e => onUpdate({...settings, overtimeThreshold: Number(e.target.value)})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Min. Guarantee ($)</label>
                                <input 
                                  type="number" 
                                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" 
                                  value={settings.minWeeklyGuarantee} 
                                  onChange={e => onUpdate({...settings, minWeeklyGuarantee: Number(e.target.value)})} 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Work Week Starts On</label>
                            <select 
                              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                              value={settings.weekStartDay}
                              onChange={e => onUpdate({...settings, weekStartDay: Number(e.target.value)})}
                            >
                                {DAYS_OF_WEEK.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Theme Mode</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { id: 'light', icon: Sun, label: 'Light' },
                                    { id: 'dark', icon: Moon, label: 'Dark' },
                                    { id: 'nightVision', icon: EyeOff, label: 'Night Vision' },
                                    { id: 'system', icon: Monitor, label: 'System' },
                                    { id: 'scheduled', icon: Clock, label: 'Scheduled' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => onUpdate({ ...settings, themeMode: mode.id as ThemeMode })}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                                            settings.themeMode === mode.id
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-white dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <mode.icon size={20} />
                                        <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {settings.themeMode === 'scheduled' && (
                            <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                    <Moon size={16} />
                                    <span className="text-sm font-bold">Dark Mode Schedule</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start At</label>
                                        <input 
                                            type="time"
                                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                            value={settings.darkScheduleStart}
                                            onChange={e => onUpdate({ ...settings, darkScheduleStart: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End At</label>
                                        <input 
                                            type="time"
                                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                            value={settings.darkScheduleEnd}
                                            onChange={e => onUpdate({ ...settings, darkScheduleEnd: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3">
                             <div className="p-2 bg-indigo-600 rounded-lg text-white h-fit">
                                <Sun size={18} />
                             </div>
                             <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                <span className="font-bold block mb-1">Theme Behavior</span>
                                {settings.themeMode === 'light' && 'Application will stay in light mode.'}
                                {settings.themeMode === 'dark' && 'Application will stay in dark mode.'}
                                {settings.themeMode === 'nightVision' && 'Red-on-black monochromatic theme to preserve your biological night vision.'}
                                {settings.themeMode === 'system' && "Follows your operating system preferences."}
                                {settings.themeMode === 'scheduled' && `Automatic switching based on time.`}
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tax' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                    <Briefcase size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-indigo-900 dark:text-indigo-100">1099 Contractor</div>
                                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">No taxes will be deducted</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => onUpdate({ ...settings, taxSettings: { ...settings.taxSettings, is1099: !settings.taxSettings.is1099 } })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.taxSettings.is1099 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.taxSettings.is1099 ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {!settings.taxSettings.is1099 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Filing Status</label>
                                    <select 
                                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                      value={settings.taxSettings.filingStatus}
                                      onChange={e => onUpdate({ ...settings, taxSettings: { ...settings.taxSettings, filingStatus: e.target.value as FilingStatus } })}
                                    >
                                        {FILING_STATUSES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Work State</label>
                                    <select 
                                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                      value={settings.taxSettings.stateCode}
                                      onChange={e => onUpdate({ ...settings, taxSettings: { ...settings.taxSettings, stateCode: e.target.value as StateCode } })}
                                    >
                                        {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Include FICA (7.65%)</span>
                                        <span className="text-[10px] text-slate-500 font-medium">Social Security & Medicare</span>
                                    </div>
                                    <button 
                                        onClick={() => onUpdate({ ...settings, taxSettings: { ...settings.taxSettings, includeFica: !settings.taxSettings.includeFica } })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.taxSettings.includeFica ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.taxSettings.includeFica ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Additional Weekly Withholding ($)</label>
                                    <input 
                                      type="number" 
                                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" 
                                      value={settings.taxSettings.additionalWithholding} 
                                      onChange={e => onUpdate({...settings, taxSettings: { ...settings.taxSettings, additionalWithholding: Number(e.target.value) }})} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                {!showResetConfirm ? (
                    <button 
                      onClick={() => setShowResetConfirm(true)} 
                      className="w-full py-4 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={16} />
                        Reset All App Data
                    </button>
                ) : (
                    <div className="flex gap-2 animate-in slide-in-from-bottom-2">
                        <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 text-sm font-bold bg-slate-200 dark:bg-slate-800 rounded-2xl">Cancel</button>
                        <button onClick={handleReset} className="flex-2 py-4 text-sm font-bold bg-red-600 text-white rounded-2xl flex items-center justify-center gap-2 px-6">
                            <Trash2 size={16} /> Confirm Reset
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};