import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Shift } from '../../types';
import { areShiftsOverlapping } from '../../utils/calculations';
import { CustomDatePicker } from '../CustomDatePicker';
import { format } from 'date-fns';

interface ShiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingShift: Shift | null;
  shifts: Shift[];
  onSave: (shift: Omit<Shift, 'id'> | Shift) => void;
  onDelete: (id: string) => void;
  initialDate?: Date;
}

export const ShiftFormModal: React.FC<ShiftFormModalProps> = ({ 
  isOpen, 
  onClose, 
  editingShift, 
  shifts, 
  onSave, 
  onDelete,
  initialDate = new Date()
}) => {
  const [formShift, setFormShift] = useState<Omit<Shift, 'id'>>({
    date: format(initialDate, 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '17:00'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (editingShift) {
      const { id, ...rest } = editingShift;
      setFormShift(rest);
    } else {
      setFormShift({
        date: format(initialDate, 'yyyy-MM-dd'),
        startTime: '08:00',
        endTime: '17:00'
      });
    }
    setFormError(null);
    setDeleteConfirmId(null);
  }, [editingShift, isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formShift.date || !formShift.startTime || !formShift.endTime) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const isOverlap = shifts.some(s => {
      if (editingShift && s.id === editingShift.id) return false;
      return areShiftsOverlapping(s, formShift);
    });

    if (isOverlap) {
      setFormError("This shift overlaps with an existing entry.");
      return;
    }

    if (editingShift) {
        onSave({ ...formShift, id: editingShift.id });
    } else {
        onSave(formShift);
    }
    onClose();
  };

  const handleDelete = () => {
      if (deleteConfirmId) {
          onDelete(deleteConfirmId);
          setDeleteConfirmId(null);
          onClose();
      }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{editingShift ? 'Edit Shift' : 'New Shift'}</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500 ml-1">Date</label>
                        <CustomDatePicker 
                        value={formShift.date} 
                        onChange={(d) => setFormShift({...formShift, date: d})} 
                        shifts={shifts}
                        />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500 ml-1">Start Time</label>
                        <input 
                            type="time" 
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formShift.startTime}
                            onChange={e => setFormShift({...formShift, startTime: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500 ml-1">End Time</label>
                        <input 
                            type="time" 
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formShift.endTime}
                            onChange={e => setFormShift({...formShift, endTime: e.target.value})}
                        />
                    </div>
                </div>

                {formError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {formError}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    {editingShift && (
                        <button 
                            type="button" 
                            onClick={() => setDeleteConfirmId(editingShift.id)}
                            className="px-5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        {editingShift ? 'Save Changes' : 'Add Shift'}
                    </button>
                </div>
            </form>

            {/* Delete Confirmation Overlay */}
            {deleteConfirmId && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-10 flex flex-col items-center justify-center p-6 rounded-3xl text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Delete this entry?</h4>
                        <p className="text-slate-500 mb-6 text-sm">This action cannot be undone.</p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none">Delete</button>
                        </div>
                </div>
            )}
        </div>
    </div>
  );
};