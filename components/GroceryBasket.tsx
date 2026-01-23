import React, { useState, useEffect } from 'react';
import { GroceryItem } from '../types';
import { Plus } from 'lucide-react';

interface GroceryBasketProps {
  groceries: GroceryItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
}

export const GroceryBasket: React.FC<GroceryBasketProps> = ({ groceries, onAdd, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  // Auto-remove logic is handled in db.ts toggle function or on render here
  // We just filter visuals here for extra safety
  const EXPIRE_MS = 12 * 60 * 60 * 1000;
  const now = Date.now();
  
  const visibleGroceries = groceries.filter(g => {
    if (!g.isChecked) return true;
    return g.checkedAt && (now - g.checkedAt < EXPIRE_MS);
  });

  const uncheckedCount = visibleGroceries.filter(g => !g.isChecked).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAdd(newItemText.trim());
      setNewItemText('');
    }
  };

  // --- ICONS ---
  const BasketIcon = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-black">
      {/* Basket Body */}
      <path d="M20 45 L80 45 L75 85 L25 85 Z" fill="#fffbeb" />
      {/* Handle */}
      <path d="M25 45 Q50 10 75 45" />
      {/* Weave details */}
      <path d="M35 45 L38 85" opacity="0.3" />
      <path d="M50 45 L50 85" opacity="0.3" />
      <path d="M65 45 L62 85" opacity="0.3" />
    </svg>
  );

  const CheckboxIcon = ({ checked }: { checked: boolean }) => (
     <svg width="24" height="24" viewBox="0 0 100 100" className="shrink-0 cursor-pointer">
         {/* Box */}
         <rect x="15" y="15" width="70" height="70" rx="15" fill={checked ? "#e5e7eb" : "white"} stroke="black" strokeWidth="6" />
         {/* Checkmark */}
         {checked && (
             <path d="M30 50 L45 65 L70 35" stroke="black" strokeWidth="8" strokeLinecap="round" fill="none" />
         )}
     </svg>
  );

  return (
    <>
      {/* 1. Backdrop Overlay (Only when open) */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)} 
        />
      )}

      {/* 2. Folded State (Trigger) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
            fixed bottom-52 right-6 z-[60] 
            w-16 h-16 rounded-full bg-[#fde047] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            flex items-center justify-center transition-transform hover:scale-105 active:scale-95
            ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <BasketIcon />
        {uncheckedCount > 0 && (
            <div className="absolute top-0 right-0 w-5 h-5 bg-red-400 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white">
                {uncheckedCount}
            </div>
        )}
      </button>

      {/* 3. Unfolded State (The List) */}
      <div 
        className={`
            fixed bottom-52 right-6 z-[60] w-[85vw] max-w-sm
            bg-[#fffbeb] rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
            flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'}
        `}
        style={{ maxHeight: '60vh' }}
      >
         {/* Header / Flap */}
         <div 
            className="bg-[#fde047] p-4 border-b-4 border-black flex justify-between items-center cursor-pointer"
            onClick={() => setIsOpen(false)}
         >
             <h3 className="font-bold text-lg flex items-center gap-2">
                 <BasketIcon /> Grocery List
             </h3>
             <div className="text-xs font-bold bg-white/50 px-2 py-1 rounded border border-black/10">
                 Tap to fold
             </div>
         </div>

         {/* Scrollable List */}
         <div className="flex-1 overflow-y-auto p-2">
            {visibleGroceries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center">
                    <p className="font-[Patrick_Hand] text-xl font-bold text-gray-400">Nothing to buy right now</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {visibleGroceries.map(item => (
                        <div 
                            key={item.id}
                            className="flex items-center gap-3 p-3 hover:bg-black/5 rounded-xl transition-colors select-none"
                            onClick={() => onToggle(item.id)}
                        >
                            <CheckboxIcon checked={item.isChecked} />
                            <span className={`font-[Patrick_Hand] text-xl font-bold leading-none pt-1 ${item.isChecked ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}
         </div>

         {/* Footer: Add Item */}
         <form onSubmit={handleSubmit} className="p-4 border-t-2 border-dashed border-black/10 bg-white/50">
             <div className="flex items-center gap-2">
                 <Plus size={20} className="text-gray-400 shrink-0" />
                 <input 
                    className="w-full bg-transparent font-[Patrick_Hand] text-xl font-bold placeholder-gray-400 focus:outline-none"
                    placeholder="Add one..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                 />
             </div>
         </form>

      </div>
    </>
  );
};
