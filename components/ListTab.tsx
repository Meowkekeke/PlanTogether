import React, { useState } from 'react';
import { TodoItem, TodoType } from '../types';
import { DoodleButton } from './DoodleButton';
import { Plus, User, Users, Check, Trash2, Shuffle, Sparkles, X } from 'lucide-react';

interface ListTabProps {
  todos: TodoItem[];
  userId: string;
  onAdd: (text: string, type: TodoType) => void;
  onToggle: (id: string) => void;
  onDelete: (todo: TodoItem) => void;
}

export const ListTab: React.FC<ListTabProps> = ({ todos, userId, onAdd, onToggle, onDelete }) => {
  const [view, setView] = useState<'list' | 'pool'>('list');
  const [filter, setFilter] = useState<TodoType | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<TodoType>('we');
  
  // Randomizer State
  const [destinyResult, setDestinyResult] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      onAdd(newText, newType);
      setNewText('');
      setIsAdding(false);
    }
  };

  const spinDestiny = () => {
    const pool = todos.filter(t => t.type === 'we' && !t.isCompleted);
    if (pool.length === 0) {
      alert("Add some 'WE' items first!");
      return;
    }
    setDestinyResult("Spinning...");
    
    let i = 0;
    const interval = setInterval(() => {
        setDestinyResult(pool[Math.floor(Math.random() * pool.length)].text);
        i++;
        if (i > 10) {
            clearInterval(interval);
        }
    }, 100);
  };

  const getFilteredTodos = () => {
    if (filter === 'all') return todos;
    return todos.filter(t => t.type === filter);
  };

  const getTypeColor = (type: TodoType) => {
    switch (type) {
      case 'me': return 'bg-green-100 border-green-300';
      case 'you': return 'bg-blue-100 border-blue-300';
      case 'we': return 'bg-yellow-100 border-yellow-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex bg-black/5 p-1 rounded-xl">
        <button 
          onClick={() => setView('list')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
        >
          📝 List
        </button>
        <button 
          onClick={() => setView('pool')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${view === 'pool' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
        >
          🎱 Pool
        </button>
      </div>

      {view === 'pool' ? (
        <div className="text-center py-10 space-y-8 animate-in fade-in">
             <div className="bg-white p-8 rounded-full w-64 h-64 mx-auto border-8 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {destinyResult ? (
                    <p className="font-bold text-2xl font-[Patrick_Hand] animate-bounce">{destinyResult}</p>
                ) : (
                    <span className="text-6xl">🎱</span>
                )}
             </div>
             
             <DoodleButton onClick={spinDestiny} className="w-full text-xl flex items-center justify-center gap-2">
                 <Sparkles /> Destiny Pick
             </DoodleButton>
             <p className="text-gray-500 font-bold">Randomly picks from "WE" list</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'me', 'you', 'we'] as const).map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1 rounded-full border-2 text-sm font-bold capitalize whitespace-nowrap ${filter === f ? 'bg-black text-white border-black' : 'bg-white border-black/10 text-gray-500'}`}
                >
                    {f}
                </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {getFilteredTodos().length === 0 && (
                <div className="text-center py-8 opacity-40 font-bold">Empty list...</div>
            )}
            
            {getFilteredTodos().map(todo => (
               <div key={todo.id} className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${todo.isCompleted ? 'opacity-50 grayscale bg-gray-100' : getTypeColor(todo.type)} ${todo.type === 'me' ? 'border-green-400' : todo.type === 'you' ? 'border-blue-400' : 'border-yellow-400'}`}>
                  <button 
                    onClick={() => onToggle(todo.id)}
                    className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center ${todo.isCompleted ? 'bg-black text-white' : 'bg-white'}`}
                  >
                     {todo.isCompleted && <Check size={14} />}
                  </button>
                  
                  <span className={`flex-1 font-bold ${todo.isCompleted ? 'line-through' : ''}`}>{todo.text}</span>
                  
                  <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/50 rounded-md border border-black/5">
                    {todo.type}
                  </div>

                  <button onClick={() => onDelete(todo)} className="text-black/20 hover:text-red-500 transition-colors">
                     <Trash2 size={16} />
                  </button>
               </div>
            ))}
          </div>
          
           {/* Add Input */}
           {isAdding ? (
              <form onSubmit={handleAdd} className="mt-4 bg-white p-4 rounded-xl border-4 border-black shadow-lg animate-in slide-in-from-bottom-2">
                 <input 
                    autoFocus
                    className="w-full text-lg font-bold border-b-2 border-black focus:outline-none bg-transparent mb-4"
                    placeholder="Add item..."
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                 />
                 <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setNewType('me')} className={`flex-1 py-1 rounded border-2 border-black font-bold text-sm ${newType === 'me' ? 'bg-green-200' : 'bg-white'}`}>ME</button>
                    <button type="button" onClick={() => setNewType('you')} className={`flex-1 py-1 rounded border-2 border-black font-bold text-sm ${newType === 'you' ? 'bg-blue-200' : 'bg-white'}`}>YOU</button>
                    <button type="button" onClick={() => setNewType('we')} className={`flex-1 py-1 rounded border-2 border-black font-bold text-sm ${newType === 'we' ? 'bg-yellow-200' : 'bg-white'}`}>WE</button>
                 </div>
                 <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="p-2 bg-gray-100 rounded-lg"><X size={20}/></button>
                    <button type="submit" className="px-4 py-2 bg-black text-white font-bold rounded-lg">Add</button>
                 </div>
              </form>
           ) : (
             <button onClick={() => setIsAdding(true)} className="w-full py-3 bg-black/5 border-2 border-black/10 border-dashed rounded-xl font-bold text-gray-400 hover:bg-black/10 flex items-center justify-center gap-2">
                <Plus size={20} /> Add Item
             </button>
           )}
        </>
      )}
    </div>
  );
};