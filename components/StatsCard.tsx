import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Briefcase, Zap } from 'lucide-react';
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

             <button onClick={() => setExpandedEarnings(!expandedEarnings)} className="w-full flex items-center justify-between text-xs font-medium bg-indigo-800/30 hover:bg-indigo-800/50 p-3 rounded-xl transition-colors border border-indigo-500/30">
                <span>{expandedEarnings ? 'Hide Details' : 'View Pay Breakdown'}</span>
                {expandedEarnings ? <ChevronDown className="rotate-180 transition-transform" size={14} /> : <ChevronDown size={14} className="transition-transform" />}
            </button>
            
            {expandedEarnings && (
                <div className="mt-3 space-y-3 text-sm text-indigo-100 border-t border-indigo-500/30 pt-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <span className="opacity-70">Regular ({stats.regularHours.toFixed(2)}h)</span>
                            <span>${stats.regularPay.toFixed(2)}</span>
                        </div>
                        {stats.overtimeHours > 0 && (
                            <div className="flex justify-between text-emerald-300 font-medium">
                                <span className="flex items-center gap-1"><Zap size={12}/> Overtime ({stats.overtimeHours.toFixed(2)}h)</span>
                                <span>+${stats.overtimePay.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold border-t border-indigo-500/20 pt-1 mt-1 text-white">
                            <span>Gross Pay</span>
                            <span>${stats.grossPay.toFixed(2)}</span>
                        </div>
                    </div>

                    {!is1099 ? (
                        <div className="space-y-1.5 pt-2 border-t border-indigo-500/20">
                            <div className="flex justify-between text-indigo-200">
                                <span>Federal Income Tax</span>
                                <span>-${stats.estimatedFederalTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-indigo-200">
                                <span>State Tax ({settings.taxSettings.stateCode})</span>
                                <span>-${stats.estimatedStateTax.toFixed(2)}</span>
                            </div>
                            {settings.taxSettings.includeFica && (
                                <div className="flex justify-between text-indigo-200">
                                    <span>FICA (SocSec/Med)</span>
                                    <span>-${stats.estimatedFICA.toFixed(2)}</span>
                                </div>
                            )}
                            {settings.taxSettings.additionalWithholding > 0 && (
                                <div className="flex justify-between text-indigo-200">
                                    <span>Extra Withholding</span>
                                    <span>-${settings.taxSettings.additionalWithholding.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-2 bg-indigo-800/40 rounded-lg text-[10px] text-center text-indigo-200">
                            1099 Contractor: You are responsible for all self-employment taxes.
                        </div>
                    )}
                    
                    <div className="pt-2 border-t border-indigo-500/30 flex justify-between text-[10px] opacity-50 italic">
                        <span>*Projections based on 2026 tax tables</span>
                    </div>
                </div>
            )}
         </div>
    </div>
  );
};