import React, { useState } from 'react';
import { Goal } from '../types';
import { DoodleButton } from './DoodleButton';
import { Trophy, Gift, Plus, Trash2, ArrowUpCircle } from 'lucide-react';

interface GoalTabProps {
  goals: Goal[];
  onAdd: (title: string, target: number, reward: string) => void;
  onIncrement: (id: string) => void;
  onDelete: (goal: Goal) => void;
  onClaim: (reward: string) => void;
}

export const GoalTab: React.FC<GoalTabProps> = ({ goals, onAdd, onIncrement, onDelete, onClaim }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(10);
  const [reward, setReward] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && reward.trim()) {
      onAdd(title, target, reward);
      setTitle('');
      setReward('');
      setTarget(10);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#fffbeb] p-6 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
        <Trophy className="mx-auto w-12 h-12 text-[#facc15] mb-2" />
        <h2 className="text-2xl font-bold">Rewards Quest</h2>
        <p className="text-gray-500 font-bold">Do stuff together, get treats!</p>
        <div className="absolute top-2 right-2 opacity-10 rotate-12">
            <Gift size={100} />
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid gap-4">
        {goals.map(goal => {
          const percent = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));
          
          return (
            <div key={goal.id} className={`relative bg-white rounded-2xl border-4 border-black p-4 shadow-md transition-all ${goal.isCompleted ? 'bg-yellow-50' : ''}`}>
               {goal.isCompleted && (
                 <div className="absolute -top-3 -right-3 bg-[#fde047] border-4 border-black px-3 py-1 rotate-12 z-10 font-bold shadow-sm">
                    DONE!
                 </div>
               )}

               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="font-bold text-xl">{goal.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 font-bold mt-1">
                        <Gift size={14} className="text-pink-500" />
                        Reward: <span className="text-pink-600 bg-pink-50 px-1 rounded">{goal.reward}</span>
                    </div>
                 </div>
                 <button onClick={() => onDelete(goal)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={18} />
                 </button>
               </div>

               {/* Progress Bar */}
               <div className="relative h-8 bg-gray-100 rounded-full border-2 border-black overflow-hidden mb-3">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#86efac] transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${percent}%` }}
                  >
                     {percent > 20 && <span className="text-xs font-bold text-black/50">{percent}%</span>}
                  </div>
                  {percent <= 20 && <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{percent}%</span>}
               </div>

               <div className="flex justify-between items-center">
                  <span className="font-bold text-2xl">{goal.currentCount} <span className="text-base text-gray-400">/ {goal.targetCount}</span></span>
                  
                  {goal.isCompleted ? (
                      <DoodleButton onClick={() => onClaim(goal.reward)} className="!py-2 !text-sm !px-4 bg-[#fde047]">
                         Claim Reward
                      </DoodleButton>
                  ) : (
                      <button 
                        onClick={() => onIncrement(goal.id)}
                        className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                      >
                         <Plus strokeWidth={4} />
                      </button>
                  )}
               </div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {isAdding ? (
         <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl border-4 border-black animate-in slide-in-from-bottom-2">
             <div className="space-y-3">
                <input 
                    className="w-full font-bold text-lg border-b-2 border-black focus:outline-none" 
                    placeholder="Goal Activity (e.g. Gym)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <div className="flex items-center gap-2">
                    <span className="font-bold whitespace-nowrap">Target:</span>
                    <input 
                        type="number"
                        className="w-20 font-bold text-lg border-2 border-black rounded-lg p-1 text-center" 
                        value={target}
                        onChange={e => setTarget(Number(e.target.value))}
                        min="1"
                        required
                    />
                    <span className="font-bold text-gray-400">times</span>
                </div>
                <input 
                    className="w-full font-bold text-lg border-b-2 border-black focus:outline-none text-pink-600 placeholder-pink-300" 
                    placeholder="Reward (e.g. Sushi Night)"
                    value={reward}
                    onChange={e => setReward(e.target.value)}
                    required
                />
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 font-bold text-gray-400">Cancel</button>
                    <DoodleButton type="submit" className="flex-1 !py-2">Start!</DoodleButton>
                </div>
             </div>
         </form>
      ) : (
         <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-4 border-black border-dashed rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:bg-black/5 transition-colors"
        >
            <Plus size={24} />
            <span className="font-bold text-xl">New Goal</span>
        </button>
      )}
    </div>
  );
};