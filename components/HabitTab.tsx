import React, { useState } from 'react';
import { Habit, HabitType } from '../types';
import { DoodleButton } from './DoodleButton';
import { Plus, Check, Trash2, Calendar, Trophy } from 'lucide-react';

interface HabitTabProps {
  habits: Habit[];
  userId: string;
  onAddHabit: (title: string, type: HabitType) => void;
  onCheckIn: (habitId: string) => void;
  onDelete: (habit: Habit) => void;
}

export const HabitTab: React.FC<HabitTabProps> = ({ habits, userId, onAddHabit, onCheckIn, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitType, setNewHabitType] = useState<HabitType>('simple');
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitTitle.trim()) {
      onAddHabit(newHabitTitle, newHabitType);
      setNewHabitTitle('');
      setIsAdding(false);
    }
  };

  const getStats = (habit: Habit) => {
    const myCount = habit.logs.filter(l => l.userId === userId).length;
    const partnerCount = habit.logs.filter(l => l.userId !== userId).length;
    return { myCount, partnerCount };
  };

  // Helper for simple heatmap (last 14 days)
  const renderHeatmap = (habit: Habit) => {
    const days = 14;
    const today = new Date();
    const dots = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isLogged = habit.logs.some(l => {
        const logDate = new Date(l.timestamp);
        return logDate.getDate() === d.getDate() && 
               logDate.getMonth() === d.getMonth() &&
               l.userId === userId;
      });
      
      dots.push(
        <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-black ${isLogged ? 'bg-[#86efac]' : 'bg-white'}`} title={d.toDateString()} />
      );
    }
    return <div className="flex gap-1 justify-center mt-2 flex-wrap">{dots}</div>;
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <button 
        onClick={() => setIsAdding(true)}
        className="w-full py-4 border-4 border-black border-dashed rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:bg-black/5 transition-colors"
      >
        <Plus size={24} />
        <span className="font-bold text-xl">New Habit</span>
      </button>

      {/* Adding Modal/Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95">
          <input 
            autoFocus
            type="text" 
            placeholder="Habit Name (e.g. Read Books)" 
            className="w-full p-2 border-b-2 border-black focus:outline-none text-xl font-bold bg-transparent placeholder-gray-300"
            value={newHabitTitle}
            onChange={e => setNewHabitTitle(e.target.value)}
          />
          
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setNewHabitType('simple')}
              className={`flex-1 py-2 rounded-lg font-bold border-2 ${newHabitType === 'simple' ? 'bg-[#fde047] border-black' : 'border-transparent text-gray-400'}`}
            >
              Simple Count
            </button>
            <button
              type="button"
              onClick={() => setNewHabitType('outcome')}
              className={`flex-1 py-2 rounded-lg font-bold border-2 ${newHabitType === 'outcome' ? 'bg-[#fde047] border-black' : 'border-transparent text-gray-400'}`}
            >
              Outcome Goal
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 font-bold text-gray-500">Cancel</button>
            <DoodleButton type="submit" className="flex-1 !py-2 !text-base">Create</DoodleButton>
          </div>
        </form>
      )}

      {/* Habit List */}
      <div className="grid gap-4">
        {habits.map(habit => {
          const { myCount, partnerCount } = getStats(habit);
          const isExpanded = expandedHabit === habit.id;

          return (
            <div key={habit.id} className="bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              {/* Header Card */}
              <div 
                onClick={() => setExpandedHabit(isExpanded ? null : habit.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-bold text-xl">{habit.title}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Trophy size={14} className="text-[#facc15]" /> You: {myCount}</span>
                    <span className="flex items-center gap-1"><Trophy size={14} className="text-gray-300" /> Partner: {partnerCount}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center border-2 border-black">
                     {myCount}
                  </div>
                </div>
              </div>

              {/* Expanded Dashboard */}
              {isExpanded && (
                <div className="p-4 border-t-2 border-black bg-gray-50 space-y-4">
                  {/* Heatmap */}
                  <div className="bg-white p-3 rounded-xl border-2 border-black/10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                      <Calendar size={12} /> Recent Activity
                    </div>
                    {renderHeatmap(habit)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={(e) => { e.stopPropagation(); onCheckIn(habit.id); }}
                        className="flex-1 py-3 bg-[#86efac] border-2 border-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4ade80] active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                     >
                        {habit.type === 'outcome' ? <><Check /> I Finished It!</> : <><Plus /> Check In</>}
                     </button>
                     
                     <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete habit?')) onDelete(habit); }}
                        className="p-3 bg-red-100 border-2 border-black rounded-xl hover:bg-red-200 text-red-600 active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                     >
                        <Trash2 size={20} />
                     </button>
                  </div>
                  
                  {habit.type === 'outcome' && (
                      <p className="text-center text-gray-500 italic text-sm">"Working on it..." counts when you start!</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};