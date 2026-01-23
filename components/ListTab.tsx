import React, { useState } from 'react';
import { TodoItem, TogetherCategory } from '../types';
import { DoodleButton } from './DoodleButton';
import { Plus, Check, Trash2, FolderOpen, Folder, Calendar, Dices, X, RotateCcw, ArrowRight, Pin } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { EmptyState } from './EmptyState';

interface ListTabProps {
  todos: TodoItem[];
  onAdd: (text: string, category: TogetherCategory, deadline?: number | null) => void;
  onComplete: (id: string) => void;
  onDelete: (todo: TodoItem) => void;
  onPin: (id: string) => void;
}

export const ListTab: React.FC<ListTabProps> = ({ todos, onAdd, onComplete, onDelete, onPin }) => {
  // Navigation: 'list' (Needs to happen), 'random' (Could happen), 'folder' (Archive)
  const [subTab, setSubTab] = useState<'list' | 'random' | 'folder'>('list');
  
  // Add Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState(''); // YYYY-MM-DD string

  // Randomizer State
  const [randomItem, setRandomItem] = useState<TodoItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Filter lists based on new structure
  // 1. Active Lists (Not completed)
  const activeListItems = todos.filter(t => (t.category === 'list' || t.type) && !t.completedAt && t.category !== 'random'); // Handle legacy items as list
  const activeRandomItems = todos.filter(t => t.category === 'random' && !t.completedAt);
  
  // 2. Archived Lists
  const completedItems = todos.filter(t => !!t.completedAt).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  // Sort Active List: Items with deadlines come first (ascending), then items without (by creation)
  const sortedListItems = [...activeListItems].sort((a, b) => {
    // Pinned always on top
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (a.deadline && b.deadline) return a.deadline - b.deadline;
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return b.createdAt - a.createdAt;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    let deadlineTimestamp: number | null = null;
    if (subTab === 'list' && hasDeadline && deadlineDate) {
       // Set time to end of day (or noon) to avoid timezone/start-of-day confusion when comparing
       const d = new Date(deadlineDate);
       // Use noon to be safe
       d.setHours(12, 0, 0, 0);
       deadlineTimestamp = d.getTime();
    }

    const category: TogetherCategory = subTab === 'random' ? 'random' : 'list';
    
    onAdd(newText, category, deadlineTimestamp);
    
    // Reset
    setNewText('');
    setHasDeadline(false);
    setDeadlineDate('');
    setIsAdding(false);
  };

  const spinRandomizer = () => {
      if (activeRandomItems.length === 0) return;
      
      setIsSpinning(true);
      let count = 0;
      const interval = setInterval(() => {
          const randomIdx = Math.floor(Math.random() * activeRandomItems.length);
          setRandomItem(activeRandomItems[randomIdx]);
          count++;
          if (count > 10) {
              clearInterval(interval);
              setIsSpinning(false);
          }
      }, 100);
  };

  const formatDate = (ts?: number | null) => {
      if (!ts) return null;
      return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const getRoughTime = (ts: number) => {
      const diff = Date.now() - ts;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return 'This week';
      return new Date(ts).toLocaleDateString();
  };

  const getCountdown = (ts: number) => {
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const target = new Date(ts);
      target.setHours(0,0,0,0);
      
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: `${Math.abs(diffDays)}d late`, color: 'bg-red-100 text-red-600 border-red-200' };
      if (diffDays === 0) return { text: 'Today!', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      if (diffDays === 1) return { text: 'Tomorrow', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      return { text: `${diffDays}d left`, color: 'bg-blue-50 text-blue-600 border-blue-100' };
  };

  // --- RENDERERS ---

  const renderAddModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddSubmit} className="bg-white w-full max-w-sm rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl">
                      {subTab === 'list' ? 'Needs to Happen' : 'Could Happen'}
                  </h3>
                  <button type="button" onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">What is it?</label>
                  <textarea 
                    autoFocus
                    className="w-full text-xl font-bold border-2 border-black rounded-xl p-3 focus:outline-none focus:ring-4 ring-yellow-200 resize-none"
                    rows={2}
                    placeholder={subTab === 'list' ? "e.g. Pay bills..." : "e.g. Get ice cream..."}
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                  />
              </div>

              {subTab === 'list' && (
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-black/5">
                      <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-600">Has a deadline?</span>
                          <button 
                            type="button"
                            onClick={() => setHasDeadline(!hasDeadline)}
                            className={`w-12 h-7 rounded-full border-2 border-black transition-colors relative ${hasDeadline ? 'bg-[#86efac]' : 'bg-gray-200'}`}
                          >
                              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white border-2 border-black rounded-full transition-transform ${hasDeadline ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                      </div>
                      
                      {hasDeadline && (
                          <input 
                            type="date" 
                            className="w-full p-2 font-bold bg-white border-2 border-black rounded-lg mt-2"
                            value={deadlineDate}
                            onChange={e => setDeadlineDate(e.target.value)}
                            required={hasDeadline}
                          />
                      )}
                  </div>
              )}

              <DoodleButton type="submit" className="w-full">
                  Add to {subTab === 'list' ? 'List' : 'Random'}
              </DoodleButton>
          </form>
      </div>
  );

  const renderRandomizer = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#fffbeb] w-full max-w-sm rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 text-center relative overflow-hidden">
               <div className="mb-8">
                   <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Fate Chose</div>
                   <h2 className={`text-4xl font-bold font-[Patrick_Hand] leading-tight ${isSpinning ? 'blur-sm' : ''}`}>
                       {randomItem?.text}
                   </h2>
               </div>

               <div className="space-y-3">
                   <DoodleButton 
                    onClick={() => { onComplete(randomItem!.id); setRandomItem(null); }}
                    className="w-full bg-[#86efac] flex items-center justify-center gap-2"
                   >
                       <Check /> Let's do it!
                   </DoodleButton>
                   
                   <div className="flex gap-2">
                       <button 
                        onClick={spinRandomizer}
                        className="flex-1 py-3 font-bold border-4 border-black rounded-xl hover:bg-gray-100 flex items-center justify-center gap-2"
                       >
                           <RotateCcw size={18} /> Pick Another
                       </button>
                       <button 
                         onClick={() => setRandomItem(null)}
                         className="flex-1 py-3 font-bold border-4 border-transparent hover:bg-black/5 rounded-xl text-gray-500"
                       >
                           Put Back
                       </button>
                   </div>
               </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-4 relative min-h-[60vh]">
      {/* 1. Navigation */}
      <div className="flex gap-2 items-center mb-6">
        <div className="flex-1 flex bg-black/5 p-1 rounded-xl">
            <button 
            onClick={() => setSubTab('list')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${subTab === 'list' ? 'bg-white shadow-sm border border-black/10' : 'text-gray-500'}`}
            >
            List
            </button>
            <button 
            onClick={() => setSubTab('random')}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${subTab === 'random' ? 'bg-white shadow-sm border border-black/10' : 'text-gray-500'}`}
            >
            Random
            </button>
        </div>
        
        <button 
            onClick={() => setSubTab('folder')}
            className={`p-3 rounded-xl border-2 transition-all ${subTab === 'folder' ? 'bg-yellow-100 border-black' : 'bg-white border-black/10 text-gray-400'}`}
        >
            {subTab === 'folder' ? <FolderOpen size={20} /> : <Folder size={20} />}
        </button>
      </div>

      {/* 2. Content Views */}

      {/* --- LIST VIEW --- */}
      {subTab === 'list' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
              {sortedListItems.length === 0 && (
                  <EmptyState 
                    type="together" 
                    message="Let's plan something!" 
                    subMessage="Add items that need to happen."
                  />
              )}
              {sortedListItems.map(item => (
                  <div key={item.id} className="group relative bg-[#fffbeb] p-4 min-h-[100px] flex flex-col justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] hover:rotate-0 transition-transform">
                      {/* Tape */}
                      {!item.isPinned && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-200/50 backdrop-blur-sm rotate-2 border-l border-r border-white/50 clip-path-tape"></div>
                      )}
                      
                      {/* Pinned Icon */}
                      {item.isPinned && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white p-1 rounded-full border-2 border-black z-20 shadow-sm animate-in zoom-in">
                              <Pin size={16} fill="currentColor" />
                          </div>
                      )}

                      <p className="font-[Patrick_Hand] text-2xl leading-6 mb-4 pr-6">{item.text}</p>
                      
                      <div className="flex justify-between items-end">
                          {/* Date Indicator & Countdown */}
                          {item.deadline ? (
                              <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-xs font-bold bg-white px-2 py-1 rounded border border-black/10 text-gray-500">
                                      <Calendar size={12} /> {formatDate(item.deadline)}
                                  </div>
                                  {(() => {
                                      const countdown = getCountdown(item.deadline);
                                      return (
                                          <div className={`text-[10px] font-bold px-2 py-1 rounded border ${countdown.color}`}>
                                              {countdown.text}
                                          </div>
                                      );
                                  })()}
                              </div>
                          ) : (
                              <div className="text-xs font-bold text-gray-300">No deadline</div>
                          )}

                          <div className="flex gap-2">
                              {/* Pin Toggle */}
                              <button 
                                onClick={() => onPin(item.id)}
                                className={`p-2 transition-colors rounded-full ${item.isPinned ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400'}`}
                                title={item.isPinned ? "Unpin from Home" : "Pin to Home"}
                              >
                                  <Pin size={18} fill={item.isPinned ? "currentColor" : "none"} />
                              </button>

                              {/* Delete */}
                              <button 
                                onClick={() => { if(confirm("Delete this?")) onDelete(item); }}
                                className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                              >
                                  <Trash2 size={18} />
                              </button>
                              {/* Complete */}
                              <button 
                                onClick={() => onComplete(item.id)}
                                className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-[#86efac] transition-colors shadow-sm"
                              >
                                  <Check />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
              
              {/* Dashed Add Card */}
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full h-24 rounded-2xl border-4 border-black/10 border-dashed flex flex-col items-center justify-center gap-2 text-gray-300 hover:bg-black/5 hover:text-gray-500 transition-colors"
              >
                  <Plus size={32} />
                  <span className="font-bold">Add to List</span>
              </button>
          </div>
      )}

      {/* --- RANDOM VIEW --- */}
      {subTab === 'random' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              
              {/* Randomizer Hero */}
              <div className="bg-white rounded-[2rem] border-4 border-black p-6 text-center shadow-md">
                   <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                       <Dices size={40} className="text-purple-600" />
                   </div>
                   <h3 className="text-xl font-bold mb-1">What should we do?</h3>
                   <p className="text-gray-500 text-sm mb-6 font-bold">{activeRandomItems.length} ideas in the pool</p>
                   
                   <DoodleButton 
                    onClick={spinRandomizer}
                    disabled={activeRandomItems.length === 0}
                    className="w-full bg-[#fde047]"
                   >
                       Pick One!
                   </DoodleButton>
              </div>

              {/* Pool List */}
              <div className="space-y-2 pb-20">
                  <h4 className="font-bold text-gray-400 text-sm uppercase tracking-widest pl-2">The Pool</h4>
                  {activeRandomItems.length === 0 ? (
                       <EmptyState 
                          type="together" 
                          message="The pool is empty." 
                          subMessage="Add fun ideas for later!"
                       />
                  ) : (
                      <div className="grid grid-cols-2 gap-2">
                          {activeRandomItems.map(item => (
                              <div key={item.id} className="bg-white p-3 border-2 border-black rounded-xl shadow-sm relative group text-center flex flex-col items-center justify-center min-h-[80px]">
                                  <p className="font-bold leading-tight">{item.text}</p>
                                  <button 
                                    onClick={() => { if(confirm("Remove this idea?")) onDelete(item); }}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-400 rounded transition-all"
                                  >
                                      <X size={14} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
                  {/* Dashed Add Card for Random */}
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full h-20 rounded-xl border-4 border-black/10 border-dashed flex flex-col items-center justify-center gap-1 text-gray-300 hover:bg-black/5 hover:text-gray-500 transition-colors mt-2"
                  >
                      <Plus size={24} />
                      <span className="font-bold">Add to Pool</span>
                  </button>
              </div>
          </div>
      )}

      {/* --- FOLDER VIEW --- */}
      {subTab === 'folder' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 text-yellow-800 text-center">
                  <span className="text-3xl font-bold block mb-1">{completedItems.length}</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">Things Done Together</span>
              </div>

              <div className="space-y-2">
                  {completedItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-70">
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                               <Check size={14} className="text-gray-500" />
                           </div>
                           <div className="flex-1 min-w-0">
                               <p className="font-bold text-gray-500 line-through truncate">{item.text}</p>
                               <p className="text-[10px] font-bold text-gray-400">{getRoughTime(item.completedAt || 0)}</p>
                           </div>
                      </div>
                  ))}
                  {completedItems.length === 0 && (
                      <div className="text-center py-12 opacity-30 font-bold text-gray-400">
                          Your shared history starts here.
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Modals */}
      {isAdding && renderAddModal()}
      {randomItem && renderRandomizer()}

    </div>
  );
};