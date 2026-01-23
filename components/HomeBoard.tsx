import React, { useState } from 'react';
import { Sticky, Mood, Signal, MOOD_COLORS } from '../types';
import { MoodIcon } from './MoodIcon';
import { DoodleButton } from './DoodleButton';
import { MoodEditor } from './MoodEditor';
import { Plus, X, Heart, Wind, Star, Coffee, Home, AlertCircle } from 'lucide-react';

interface HomeBoardProps {
  stickies: Sticky[];
  userId: string;
  getUserName: (id: string) => string;
  onAddSticky: (type: any, content: any) => void;
  onDeleteSticky: (id: string) => void;
}

export const HomeBoard: React.FC<HomeBoardProps> = ({ stickies, userId, getUserName, onAddSticky, onDeleteSticky }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'mood' | 'note' | 'signal' | null>(null);
  const [noteText, setNoteText] = useState('');

  // 1. Filter & Sort Stickies
  // Filter out expired (older than 24h) - double safety check in UI
  const now = Date.now();
  const validStickies = stickies
    .filter(s => (now - s.timestamp) < (24 * 60 * 60 * 1000))
    .sort((a, b) => b.timestamp - a.timestamp); // Newest first

  // 2. Rendering Helpers
  const renderSignalIcon = (signal: Signal) => {
    switch (signal) {
      case Signal.SPACE: return <div className="flex flex-col items-center"><Wind size={48} className="text-blue-600" /><span className="text-sm font-bold mt-1">Need Space</span></div>;
      case Signal.MISS_YOU: return <div className="flex flex-col items-center"><Heart size={48} className="text-red-500 fill-current" /><span className="text-sm font-bold mt-1">Miss You</span></div>;
      case Signal.ATTENTION: return <div className="flex flex-col items-center"><Star size={48} className="text-yellow-500 fill-current" /><span className="text-sm font-bold mt-1">Attention</span></div>;
      case Signal.LOVE: return <div className="flex flex-col items-center"><Heart size={48} className="text-pink-500 animate-pulse fill-current" /><span className="text-sm font-bold mt-1">Love</span></div>;
      case Signal.COFFEE: return <div className="flex flex-col items-center"><Coffee size={48} className="text-amber-700" /><span className="text-sm font-bold mt-1">Break?</span></div>;
      case Signal.HOME: return <div className="flex flex-col items-center"><Home size={48} className="text-green-600" /><span className="text-sm font-bold mt-1">Coming Home</span></div>;
      default: return <AlertCircle />;
    }
  };

  const getStickyColor = (ownerId: string) => {
    const isMe = ownerId === userId;
    // Green theme for me, Blue theme for partner
    if (isMe) return 'bg-[#86efac] border-[#22c55e]'; // Green-300
    return 'bg-[#93c5fd] border-[#3b82f6]'; // Blue-300
  };
  
  const getStickyRotation = (index: number, storedRotation: number) => {
      return storedRotation || (index % 2 === 0 ? 2 : -2);
  };

  return (
    <div className="relative h-full min-h-[70vh] flex flex-col items-center p-4 overflow-hidden">
      
      {/* Empty State */}
      {validStickies.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none">
          <div className="w-32 h-32 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center mb-4">
            <span className="text-6xl grayscale">🍃</span>
          </div>
          <p className="font-bold text-xl text-gray-500 text-center max-w-[200px]">
            Nothing here right now.<br/>That's okay.
          </p>
        </div>
      )}

      {/* Sticky Board Canvas */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 py-10 relative z-10">
        {validStickies.map((sticky, index) => {
          const isMe = sticky.userId === userId;
          const isOld = index > 4; // Fade out older items
          const colorClass = getStickyColor(sticky.userId);
          const rotation = getStickyRotation(index, sticky.rotation);
          const senderName = getUserName(sticky.userId);
          
          return (
            <div 
              key={sticky.id}
              className={`
                relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all duration-500 flex flex-col
                w-44 h-44 shrink-0
                ${colorClass}
                ${isOld ? 'opacity-60 scale-90 grayscale-[0.3]' : 'scale-100'}
                ${index === 0 ? 'z-20 scale-105' : 'z-10'}
              `}
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
              onContextMenu={(e) => {
                 e.preventDefault();
                 if(isMe && confirm("Delete this post-it?")) onDeleteSticky(sticky.id);
              }}
            >
              {/* Tape for decoration */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-sm rotate-1 border border-white/50 clip-path-tape"></div>

              {/* Content Area - Flex Center */}
              <div className="flex-1 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                
                {sticky.type === 'mood' && sticky.mood && (
                  <>
                     <div className="mb-1 drop-shadow-sm">
                        <MoodIcon mood={sticky.mood} className="w-20 h-20" />
                     </div>
                     {sticky.text && (
                       <p className="font-[Patrick_Hand] text-sm leading-tight font-bold break-words w-full line-clamp-2 px-1">
                          "{sticky.text}"
                       </p>
                     )}
                  </>
                )}

                {sticky.type === 'note' && (
                  <div className="flex items-center justify-center h-full w-full">
                     <p className="font-[Patrick_Hand] text-xl leading-6 font-bold break-words w-full line-clamp-4">
                        {sticky.text}
                     </p>
                  </div>
                )}

                {sticky.type === 'signal' && sticky.signal && (
                   <div className="flex flex-col items-center justify-center h-full text-black/80">
                      {renderSignalIcon(sticky.signal)}
                   </div>
                )}
              </div>

              {/* Name Tag */}
              <div className="absolute -bottom-3 -right-2 bg-white border-2 border-black px-2 py-0.5 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg] z-20">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">{senderName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button - Positioned higher (bottom-32) to avoid nav overlap */}
      <div className="fixed bottom-32 right-6 z-50 flex flex-col items-end gap-3">
         {showMenu && (
           <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 mb-2">
              <button 
                onClick={() => { setActiveModal('mood'); setShowMenu(false); }}
                className="flex items-center gap-2 bg-[#fde047] px-4 py-2 rounded-xl border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
              >
                 <span className="text-sm">Mood</span> <div className="bg-black text-yellow-300 rounded-full p-1"><Plus size={12}/></div>
              </button>
              <button 
                onClick={() => { setActiveModal('note'); setShowMenu(false); }}
                className="flex items-center gap-2 bg-[#fff] px-4 py-2 rounded-xl border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
              >
                 <span className="text-sm">Note</span> <div className="bg-black text-white rounded-full p-1"><Plus size={12}/></div>
              </button>
              <button 
                onClick={() => { setActiveModal('signal'); setShowMenu(false); }}
                className="flex items-center gap-2 bg-[#fca5a5] px-4 py-2 rounded-xl border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
              >
                 <span className="text-sm">Signal</span> <div className="bg-black text-red-200 rounded-full p-1"><Plus size={12}/></div>
              </button>
           </div>
         )}
         
         <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`w-16 h-16 rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${showMenu ? 'bg-black text-white rotate-45' : 'bg-[#86efac] text-black hover:bg-[#4ade80]'}`}
         >
            <Plus size={32} strokeWidth={3} />
         </button>
      </div>

      {/* MODALS */}
      
      {/* 1. Mood Picker (Reusing MoodEditor logic but simplified saving) */}
      {activeModal === 'mood' && (
        <MoodEditor 
            currentMood={Mood.HAPPY} 
            currentNote=""
            onSave={(mood, note) => {
                onAddSticky('mood', { mood, text: note });
                setActiveModal(null);
            }}
            onCancel={() => setActiveModal(null)}
        />
      )}

      {/* 2. Note Input */}
      {activeModal === 'note' && (
         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Leave a Note</h3>
                    <button onClick={() => setActiveModal(null)}><X /></button>
                </div>
                <textarea 
                    autoFocus
                    className="w-full text-2xl font-[Patrick_Hand] border-2 border-black rounded-xl p-4 focus:outline-none focus:ring-4 ring-green-200 resize-none mb-4"
                    rows={3}
                    placeholder="Short & sweet..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    maxLength={80}
                />
                <DoodleButton 
                    onClick={() => {
                        if(noteText.trim()) {
                            onAddSticky('note', { text: noteText });
                            setNoteText('');
                            setActiveModal(null);
                        }
                    }}
                    className="w-full"
                >
                    Stick It
                </DoodleButton>
            </div>
         </div>
      )}

      {/* 3. Signal Picker */}
      {activeModal === 'signal' && (
         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white w-full max-w-sm rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Send a Signal</h3>
                    <button onClick={() => setActiveModal(null)}><X /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { s: Signal.LOVE, label: 'Love', color: 'bg-pink-200' },
                        { s: Signal.MISS_YOU, label: 'Miss You', color: 'bg-red-200' },
                        { s: Signal.SPACE, label: 'Need Space', color: 'bg-blue-200' },
                        { s: Signal.COFFEE, label: 'Break?', color: 'bg-orange-200' },
                        { s: Signal.ATTENTION, label: 'Look at me', color: 'bg-yellow-200' },
                        { s: Signal.HOME, label: 'Coming Home', color: 'bg-green-200' },
                    ].map(sig => (
                        <button
                            key={sig.s}
                            onClick={() => {
                                onAddSticky('signal', { signal: sig.s });
                                setActiveModal(null);
                            }}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-black hover:scale-105 transition-transform ${sig.color}`}
                        >
                            {renderSignalIcon(sig.s)}
                        </button>
                    ))}
                </div>
             </div>
         </div>
      )}
    </div>
  );
};