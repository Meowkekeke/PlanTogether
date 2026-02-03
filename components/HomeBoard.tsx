
import React, { useState } from 'react';
import { Sticky, Mood, Signal, GroceryItem, MoneyEntry } from '../types';
import { MoodIcon } from './MoodIcon';
import { DoodleButton } from './DoodleButton';
import { MoodEditor } from './MoodEditor';
import { Plus, X, Trash2, Pin, Calendar } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { GroceryBasket } from './GroceryBasket';

interface HomeBoardProps {
  stickies: Sticky[];
  groceries: GroceryItem[];
  userId: string;
  moneyTotal: number;
  getUserName: (id: string) => string;
  onAddSticky: (type: any, content: any) => void;
  onDeleteSticky: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onAddGrocery: (text: string) => void;
  onToggleGrocery: (id: string) => void;
}

export const HomeBoard: React.FC<HomeBoardProps> = ({ 
    stickies, groceries, userId, getUserName, moneyTotal,
    onAddSticky, onDeleteSticky, onTogglePin,
    onAddGrocery, onToggleGrocery
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'mood' | 'note' | 'signal' | null>(null);
  const [noteText, setNoteText] = useState('');

  // 1. Filter & Sort Stickies
  // Filter out older than 4 HOURS unless pinned
  const now = Date.now();
  const validStickies = stickies
    .filter(s => s.isPinned || (now - s.timestamp) < (4 * 60 * 60 * 1000))
    // Sort: Pinned first, then newest
    .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp - a.timestamp;
    }); 

  // 2. Helpers - Custom SVGs for Signals
  const renderSignalIcon = (signal: Signal) => {
    const props = {
        width: 48,
        height: 48,
        viewBox: "0 0 100 100",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "5",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        className: "text-black mb-1"
    };

    switch (signal) {
      case Signal.SPACE: // Cloud
        return (
            <svg {...props}>
                <path d="M25 60 Q10 60 10 45 Q10 30 25 30 Q30 10 50 15 Q70 5 80 25 Q95 25 90 45 Q95 60 75 60 L25 60 Z" fill="#bfdbfe" />
            </svg>
        );
      case Signal.MISS_YOU: // Paper Plane
        return (
            <svg {...props}>
                <path d="M10 50 L90 20 L50 90 L40 60 L10 50 Z" fill="#fff" stroke="black" />
                <path d="M40 60 L90 20" stroke="black" />
            </svg>
        );
      case Signal.ATTENTION: // Bell
        return (
            <svg {...props}>
                <path d="M50 15 Q20 15 20 60 L10 75 L90 75 L80 60 Q80 15 50 15" fill="#fde047" stroke="black" />
                <circle cx="50" cy="85" r="5" fill="black" stroke="none" />
            </svg>
        );
      case Signal.LOVE: // Potion Bottle
        return (
            <svg {...props}>
                 <path d="M40 15 L40 30 L25 80 Q25 90 50 90 Q75 90 75 80 L60 30 L60 15" fill="#fca5a5" stroke="black" />
                 <path d="M35 15 L65 15" stroke="black" />
                 <path d="M40 45 L60 45" stroke="black" opacity="0.2" />
                 <path d="M30 70 L70 70" stroke="black" opacity="0.2" />
            </svg>
        );
      case Signal.COFFEE: // Mug
        return (
            <svg {...props}>
                <path d="M25 30 L25 70 Q25 90 50 90 Q75 90 75 70 L75 30" fill="#fdba74" stroke="black" />
                <path d="M75 40 Q95 40 95 55 Q95 70 75 70" fill="none" stroke="black" />
                <path d="M35 20 Q40 10 45 20" stroke="black" opacity="0.5" />
                <path d="M55 20 Q60 10 65 20" stroke="black" opacity="0.5" />
            </svg>
        );
      case Signal.HOME: // House
        return (
            <svg {...props}>
                 <path d="M20 40 L50 15 L80 40 L80 85 L20 85 Z" fill="#86efac" stroke="black" />
                 <rect x="42" y="55" width="16" height="30" fill="#fde047" stroke="black" />
            </svg>
        );
      default: return null;
    }
  };

  // Sticky Color
  const getStickyColor = (ownerId: string) => {
    const isMe = ownerId === userId;
    // Lighter Green for me, Lighter Blue for partner
    if (isMe) return 'bg-[#dcfce7] border-[#86efac]'; // Green-100 bg, Green-300 border
    return 'bg-[#dbeafe] border-[#93c5fd]'; // Blue-100 bg, Blue-300 border
  };
  
  // Random translation logic helper to make it look scattered
  const getScatteredStyle = (id: string, index: number) => {
      // Use ID to make randomness consistent per render (pseudo-random)
      const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
      const rotate = (seed % 10) - 5; // -5 to 5 deg
      const translateX = (seed % 20) - 10; // -10 to 10px
      const translateY = (seed % 20) - 10;
      
      return {
          transform: `rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`,
          zIndex: 10 + index // Newest on top if overlapping
      };
  };

  const getCountdown = (ts: number) => {
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const target = new Date(ts);
      target.setHours(0,0,0,0);
      
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: `${Math.abs(diffDays)}d late`, color: 'bg-red-100 text-red-600' };
      if (diffDays === 0) return { text: 'Today!', color: 'bg-orange-100 text-orange-700' };
      if (diffDays === 1) return { text: 'Tomorrow', color: 'bg-yellow-100 text-yellow-700' };
      return { text: `${diffDays}d left`, color: 'bg-blue-50 text-blue-600' };
  };

  const getMoodPhrase = (mood: Mood) => {
      switch(mood) {
          case Mood.HAPPY: return "I am happy";
          case Mood.EXCITED: return "I am excited";
          case Mood.ROMANTIC: return "I am romantic";
          case Mood.CHILL: return "I am chill";
          case Mood.GRATEFUL: return "I am grateful";
          case Mood.HUNGRY: return "I am hungry";
          case Mood.TIRED: return "I am tired";
          case Mood.CONFUSED: return "I am confused";
          case Mood.SAD: return "I am sad";
          case Mood.ANGRY: return "I am angry";
          case Mood.SICK: return "I am sick";
          case Mood.STRESSED: return "I am stressed";
          default: return `I am ${mood}`;
      }
  };

  const getSignalPhrase = (signal: Signal) => {
      switch(signal) {
          case Signal.LOVE: return "I love you!";
          case Signal.MISS_YOU: return "I miss you so much.";
          case Signal.SPACE: return "Need a little space.";
          case Signal.COFFEE: return "Wanna take a break together?";
          case Signal.ATTENTION: return "Pay attention to me!";
          case Signal.HOME: return "I'm coming home!";
          default: return "";
      }
  };

  return (
    <div className="relative h-full min-h-[70vh] flex flex-col items-center p-2 overflow-hidden">
      
      {/* Persistence Hint */}
      <div className="w-full flex justify-center pb-2 opacity-60 pointer-events-none">
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-black/5">
           <span>Stickies disappear in 4h unless pinned</span>
           <Pin size={10} fill="currentColor" />
        </div>
      </div>

      {/* Money Bar - Inserted Here */}
      <div className="w-full max-w-lg px-2 mb-2 relative z-20 animate-in slide-in-from-top-4">
          <div className="bg-white border-4 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between relative overflow-hidden">
              {/* Decorative Background for Money Bar */}
              <div className="absolute inset-0 bg-emerald-50/50 pointer-events-none" />
              
              <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 shrink-0">
                      {/* Doodle Star Coin SVG */}
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                        {/* Coin Body */}
                        <circle cx="50" cy="50" r="42" fill="#fde047" stroke="black" strokeWidth="4" />
                        {/* Inner Rim Highlight */}
                        <circle cx="50" cy="50" r="34" fill="none" stroke="white" strokeWidth="3" opacity="0.5" />
                        {/* Star */}
                        <path d="M50 25 L56.5 42.5 L75 42.5 L60 55 L65.5 72.5 L50 62.5 L34.5 72.5 L40 55 L25 42.5 L43.5 42.5 Z" fill="#fff" stroke="black" strokeWidth="3" strokeLinejoin="round" />
                      </svg>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Our Budget</span>
                      <span className="font-bold text-lg leading-none">Piggy Bank</span>
                  </div>
              </div>

              <div className={`relative z-10 text-3xl font-black font-[Patrick_Hand] ${moneyTotal < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(moneyTotal)}
              </div>
          </div>
      </div>

      {/* Empty State */}
      {validStickies.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-10">
           <EmptyState 
             type="home"
             message="Quiet Garden"
             subMessage="Tap + to share how you feel!"
           />
        </div>
      )}

      {/* Sticky Board Canvas - UPDATED: Scattered Flex Layout */}
      <div className="w-full max-w-lg flex flex-wrap justify-center content-start gap-4 py-6 px-2 relative z-10">
        {validStickies.map((sticky, index) => {
          const isPinned = sticky.isPinned;
          const isMe = sticky.userId === userId;
          
          // Visual Styles - Keep original color even if pinned
          const colorClass = getStickyColor(sticky.userId);
          const style = getScatteredStyle(sticky.id, index);
          const senderName = getUserName(sticky.userId);
          
          return (
            <div 
              key={sticky.id}
              className={`
                relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all duration-300 flex flex-col
                w-[45%] h-32 
                ${colorClass}
                ${isPinned ? 'ring-2 ring-black/20' : ''}
                hover:z-50 hover:scale-105 group
              `}
              style={style}
            >
              
              {/* Pin Indicator / Decoration */}
              {isPinned && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-sm">
                     <Pin size={20} fill="currentColor" className="text-black rotate-[30deg]" />
                 </div>
              )}
              {/* Tape for unpinned */}
              {!isPinned && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/40 backdrop-blur-sm rotate-1 border border-white/50 clip-path-tape pointer-events-none"></div>
              )}

              {/* Action Buttons Container */}
              <div className="absolute top-1 right-1 flex gap-1 z-50">
                  {/* Pin Toggle */}
                  {isMe && onTogglePin && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onTogglePin(sticky.id); }}
                        className={`p-1.5 rounded-full hover:bg-white/50 transition-colors ${isPinned ? 'text-black' : 'text-black/20 hover:text-black'}`}
                      >
                          <Pin size={12} fill={isPinned ? "currentColor" : "none"} />
                      </button>
                  )}
                  {/* Delete Button */}
                  <button 
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          if(confirm(isPinned ? "Unpin and remove this sticky?" : "Tear off this sticky note?")) {
                              onDeleteSticky(sticky.id);
                          }
                      }}
                      className="p-1.5 text-black/20 hover:text-red-500 transition-colors rounded-full hover:bg-white/50"
                  >
                      <Trash2 size={12} />
                  </button>
              </div>

              {/* Deadline Badge (if pinned and has deadline) */}
              {sticky.deadline && (
                  <div className="absolute top-1 left-1 z-20">
                      {(() => {
                          const cd = getCountdown(sticky.deadline);
                          return (
                              <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold border border-black/10 flex items-center gap-1 shadow-sm ${cd.color}`}>
                                  <Calendar size={8} /> {cd.text}
                              </div>
                          );
                      })()}
                  </div>
              )}

              {/* Content Area - Flex Center */}
              <div className="flex-1 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                
                {sticky.type === 'mood' && sticky.mood && (
                  <div className="flex flex-col items-center justify-center h-full w-full">
                     <div className="mb-1 text-black/80">
                        <MoodIcon mood={sticky.mood} className="w-10 h-10" />
                     </div>
                     <p className="font-[Patrick_Hand] text-base leading-tight font-bold break-words w-full line-clamp-3 px-1">
                        "{sticky.text}"
                     </p>
                  </div>
                )}

                {sticky.type === 'note' && (
                  <div className="flex items-center justify-center h-full w-full">
                     <p className={`font-[Patrick_Hand] font-bold break-words w-full line-clamp-3 ${isPinned ? 'text-lg leading-tight' : 'text-xl leading-5'}`}>
                        {sticky.text}
                     </p>
                  </div>
                )}

                {sticky.type === 'signal' && sticky.signal && (
                   <div className="flex flex-col items-center justify-center h-full text-black/80 gap-1">
                      {/* Only showing Icon + Sentence, no label */}
                      {renderSignalIcon(sticky.signal)}
                      <p className="font-[Patrick_Hand] text-sm leading-4 font-bold px-1 line-clamp-2">
                        "{sticky.text}"
                      </p>
                   </div>
                )}
              </div>

              {/* Name Tag */}
              <div className={`absolute -bottom-2 -right-1 bg-white border-2 border-black px-1.5 py-0 rounded-md shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg] z-20 pointer-events-none`}>
                  <span className="text-[9px] font-black uppercase tracking-wider text-black">{senderName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* GROCERY LIST - Bottom Left Fixed */}
      <GroceryBasket 
         groceries={groceries || []} 
         onAdd={onAddGrocery}
         onToggle={onToggleGrocery}
      />

      {/* Floating Action Button */}
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
            className={`w-16 h-16 rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${showMenu ? 'bg-black text-white rotate-45' : 'bg-[#fde047] text-black hover:bg-[#facc15]'}`}
         >
            <Plus size={32} strokeWidth={3} />
         </button>
      </div>

      {/* MODALS */}
      
      {/* 1. Mood Picker */}
      {activeModal === 'mood' && (
        <MoodEditor 
            currentMood={Mood.HAPPY} 
            currentNote=""
            onSave={(mood, note) => {
                let finalNote = "";
                if (note && note.trim()) {
                    // Combine mood with note using 'as I am'
                    finalNote = `I am ${mood} as I am ${note.trim()}`;
                } else {
                    finalNote = getMoodPhrase(mood);
                }
                onAddSticky('mood', { mood, text: finalNote });
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
                                const phrase = getSignalPhrase(sig.s);
                                onAddSticky('signal', { signal: sig.s, text: phrase });
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
