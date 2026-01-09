import React from 'react';
import { Settings, Moon, Sun, EyeOff } from 'lucide-react';

interface HeaderProps {
  companyName: string;
  theme: 'light' | 'dark' | 'night-vision';
  toggleTheme: () => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ companyName, theme, toggleTheme, onSettingsClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
         <div className="max-w-xl mx-auto flex items-center">
            {/* Logo and Brand Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                    W
                </div>
                <h1 className="font-bold text-lg tracking-tight truncate text-slate-800 dark:text-slate-100">
                  {companyName || 'WorkTrack'}
                </h1>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={toggleTheme} 
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
                  aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <EyeOff size={20} />}
                </button>
                <button 
                  onClick={onSettingsClick} 
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
                  aria-label="Open Settings"
                >
                    <Settings size={20} />
                </button>
            </div>
         </div>
    </header>
  );
};