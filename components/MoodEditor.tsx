import React, { useState } from 'react';
import { Mood, MOOD_COLORS, MOOD_CATEGORIES, MoodCategory } from '../types';
import { DoodleButton } from './DoodleButton';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { MoodIcon } from './MoodIcon';

interface MoodEditorProps {
  currentMood: Mood;
  currentNote: string;
  onSave: (mood: Mood, note: string) => void;
  onCancel: () => void;
}

// Custom Category Icons
const CategoryIcon = ({ category }: { category: MoodCategory }) => {
    const props = {
        viewBox: "0 0 100 100",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "6",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        className: "w-6 h-6 mr-2"
    };

    switch(category) {
        case 'positive': // Sun
            return (
                <svg {...props}>
                    <circle cx="50" cy="50" r="25" fill="#fde047" stroke="black" />
                    <path d="M50 10 L50 20 M50 80 L50 90" stroke="black" />
                    <path d="M10 50 L20 50 M80 50 L90 50" stroke="black" />
                    <path d="M22 22 L28 28 M72 72 L78 78" stroke="black" />
                    <path d="M22 78 L28 72 M72 28 L78 22" stroke="black" />
                </svg>
            );
        case 'neutral': // Cloud
            return (
                 <svg {...props}>
                    <path d="M25 65 Q10 65 10 50 Q10 35 25 35 Q30 15 50 20 Q70 10 80 30 Q95 30 90 50 Q95 65 75 65 L25 65 Z" fill="#f3f4f6" stroke="black" />
                </svg>
            );
        case 'negative': // Storm
            return (
                <svg {...props}>
                    <path d="M25 60 Q10 60 10 45 Q10 30 25 30 Q30 10 50 15 Q70 5 80 25 Q95 25 90 45 Q95 60 75 60 L25 60 Z" fill="#93c5fd" stroke="black" />
                    <path d="M40 60 L35 75 L45 75 L40 85" stroke="black" strokeWidth="3" />
                    <path d="M65 60 L60 75 L70 75 L65 85" stroke="black" strokeWidth="3" />
                </svg>
            );
    }
}

export const MoodEditor: React.FC<MoodEditorProps> = ({ currentMood, currentNote, onSave, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState<MoodCategory>('positive');
  const [selectedMood, setSelectedMood] = useState<Mood>(currentMood);
  const [note, setNote] = useState(currentNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedMood, note);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fffbeb] w-full max-w-sm rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-[#fde047] fill-current" size={24} />
                How are you?
            </h2>
            <button 
              onClick={onCancel}
              className="p-2 bg-white border-2 border-black rounded-full hover:bg-red-100 transition-colors shadow-sm active:translate-y-0.5"
            >
              <X size={20} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          
          {/* 1. Category Tabs */}
          <div className="flex gap-2 mb-4 p-1 bg-black/5 rounded-2xl">
            {(Object.keys(MOOD_CATEGORIES) as MoodCategory[]).map((cat) => {
                const isActive = selectedCategory === cat;
                const categoryData = MOOD_CATEGORIES[cat];
                return (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                            flex-1 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center
                            ${isActive 
                                ? 'bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-1px]' 
                                : 'bg-transparent border-transparent text-gray-500 hover:bg-black/5'
                            }
                        `}
                    >
                        <CategoryIcon category={cat} />
                        {categoryData.label}
                    </button>
                )
            })}
          </div>

          {/* 2. Mood Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1 mb-4">
             <div className="grid grid-cols-3 gap-3">
                {MOOD_CATEGORIES[selectedCategory].moods.map((mood) => (
                    <button
                        key={mood}
                        type="button"
                        onClick={() => setSelectedMood(mood)}
                        className={`
                        aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 relative overflow-hidden
                        ${selectedMood === mood 
                            ? `border-black ${MOOD_COLORS[mood]} scale-95 ring-4 ring-black/10` 
                            : 'border-black/10 hover:border-black/30 hover:bg-white bg-white/50'
                        }
                        `}
                    >
                        <MoodIcon mood={mood} className="w-10 h-10 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-black/70">
                            {mood}
                        </span>
                        
                        {selectedMood === mood && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full animate-ping" />
                        )}
                    </button>
                ))}
             </div>
          </div>

          {/* 3. Note & Save */}
          <div className="space-y-4 pt-4 border-t-2 border-black/10">
            <div className="relative">
                <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 pr-12 border-2 border-black rounded-xl resize-none focus:outline-none focus:ring-4 ring-[#86efac]/30 text-lg font-[Patrick_Hand] bg-white shadow-inner placeholder:text-gray-300"
                rows={2}
                placeholder="doing what? (e.g. eating)"
                maxLength={60}
                />
                <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-300">
                    {note.length}/60
                </div>
            </div>

            <DoodleButton type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 py-3 text-lg">
              Post It <ChevronRight size={20} />
            </DoodleButton>
          </div>
        </form>
      </div>
    </div>
  );
};
