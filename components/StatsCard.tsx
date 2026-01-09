import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Briefcase } from 'lucide-react';
import { ShiftStats, AppSettings } from '../types';

interface StatsCardProps {
  stats: ShiftStats;
  settings: AppSettings;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, settings }) => {
  const [expandedEarnings, setExpandedEarnings] = useState(false);
  const is1099 = settings.taxSettings.is1099;

  return (
    <div className="material-card bg-indigo-600 text-white p-6 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
         <div className="relative z-10">
             <div className="flex justify-between items-start mb-6">
                 <div>
                     <p className="text-indigo-100 text-sm font-medium mb-1">Estimated Earnings</p>
                     <h2 className="text-4xl font-bold tracking-tight">
                        ${stats.netPay.toFixed(2)}
                     </h2>
                     {stats.guaranteeApplied && (
                         <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/50 border border-indigo-400/30 text-indigo-50">
                             <ShieldCheck size={12} className="mr-1" /> Guaranteed Min. Applied
                         </div>
                     )}
                 </div>
                 <div className="text-right">
                     <p className="text-indigo-100 text-sm font-medium mb-1">Total Hours</p>
                     <div className="text-2xl font-bold">{stats.totalHours.toFixed(2)}<span className="text-sm font-normal text-indigo-200 ml-1">h</span></div>
                 </div>
             </div>

             {!is1099 ? (
                 <>
                    <button onClick={() => setExpandedEarnings(!expandedEarnings)} className="w-full flex items-center justify-between text-xs font-medium bg-indigo-800/30 hover:bg-indigo-800/50 p-3 rounded-xl transition-colors border border-indigo-500/30">
                        <span>{expandedEarnings ? 'Hide Breakdown' : 'View Tax Breakdown'}</span>
                        {expandedEarnings ? <ChevronDown className="rotate-180 transition-transform" size={14} /> : <ChevronDown size={14} className="transition-transform" />}
                    </button>
                    
                    {expandedEarnings && (
                        <div className="mt-3 space-y-2 text-sm text-indigo-100 border-t border-indigo-500/30 pt-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between">
                                <span>Gross Pay</span>
                                <span>${stats.grossPay.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-indigo-200">
                                <span>Federal Tax</span>
                                <span>-${stats.estimatedFederalTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-indigo-200">
                                <span>State Tax ({settings.taxSettings.stateCode})</span>
                                <span>-${stats.estimatedStateTax.toFixed(2)}</span>
                            </div>
                            {settings.taxSettings.includeFica && (
                                <div className="flex justify-between text-indigo-200">
                                    <span>FICA (7.65%)</span>
                                    <span>-${stats.estimatedFICA.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="mt-2 pt-2 border-t border-indigo-500/30 flex justify-between text-xs opacity-70">
                                <span>*Estimates based on weekly withholding logic</span>
                            </div>
                        </div>
                    )}
                 </>
             ) : (
                <div className="w-full flex items-center justify-center gap-2 text-xs font-medium text-indigo-200 bg-indigo-800/20 p-2 rounded-lg border border-indigo-500/20">
                     <Briefcase size={12} />
                     1099 Contractor (No Withholding)
                </div>
             )}
         </div>
    </div>
  );
};