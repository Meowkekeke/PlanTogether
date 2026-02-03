
import React, { useState } from 'react';
import { MoneyEntry } from '../types';
import { DoodleButton } from './DoodleButton';
import { Plus, X, Trash2, Calendar, Pencil, ArrowLeft } from 'lucide-react';

interface MoneyViewProps {
  entries: MoneyEntry[];
  userId: string;
  onAdd: (amount: number, note: string, date: number) => void;
  onEdit: (id: string, updates: Partial<MoneyEntry>) => void;
  onDelete: (id: string) => void;
}

export const MoneyView: React.FC<MoneyViewProps> = ({ entries, userId, onAdd, onEdit, onDelete }) => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [amountStr, setAmountStr] = useState('');
  const [sign, setSign] = useState<'+' | '-'>('-');
  const [note, setNote] = useState('');
  const [dateStr, setDateStr] = useState(''); // YYYY-MM-DD

  // Calculated Total
  const total = entries.reduce((acc, curr) => acc + curr.amount, 0);

  const resetForm = () => {
    setAmountStr('');
    setSign('-');
    setNote('');
    setDateStr(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setView('add');
  };

  const handleStartEdit = (entry: MoneyEntry) => {
    setEditingId(entry.id);
    setAmountStr(Math.abs(entry.amount).toString());
    setSign(entry.amount >= 0 ? '+' : '-');
    setNote(entry.note);
    setDateStr(new Date(entry.timestamp).toISOString().split('T')[0]);
    setView('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr);
    if (isNaN(val) || !note.trim()) return;

    const finalAmount = sign === '+' ? val : -val;
    const timestamp = dateStr ? new Date(dateStr).getTime() : Date.now();

    if (view === 'add') {
      onAdd(finalAmount, note.trim(), timestamp);
    } else if (view === 'edit' && editingId) {
      onEdit(editingId, { amount: finalAmount, note: note.trim(), timestamp });
    }

    resetForm();
    setView('list');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getRelativeDate = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Sort entries: Newest first
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  const renderForm = (mode: 'add' | 'edit') => (
    <div className="bg-white p-6 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-10">
      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('list')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20}/></button>
            <h3 className="text-xl font-bold">{mode === 'add' ? 'New Entry' : 'Edit Entry'}</h3>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Amount Input Group */}
          <div className="flex items-center gap-2">
             <div className="flex bg-gray-100 rounded-xl p-1 shrink-0 border-2 border-transparent">
                 <button type="button" onClick={() => setSign('+')} className={`w-12 h-12 rounded-lg font-black text-2xl flex items-center justify-center transition-all ${sign === '+' ? 'bg-[#86efac] border-2 border-black shadow-sm' : 'text-gray-400'}`}>+</button>
                 <button type="button" onClick={() => setSign('-')} className={`w-12 h-12 rounded-lg font-black text-2xl flex items-center justify-center transition-all ${sign === '-' ? 'bg-red-300 border-2 border-black shadow-sm' : 'text-gray-400'}`}>-</button>
             </div>
             <input 
                type="number" 
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                className="w-full text-4xl font-bold p-2 bg-transparent border-b-4 border-black/10 focus:border-black focus:outline-none placeholder-gray-300 font-mono text-right"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
             />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Note</label>
             <input 
                className="w-full text-xl font-bold p-3 bg-gray-50 border-2 border-black rounded-xl focus:outline-none focus:ring-4 ring-yellow-200"
                placeholder="What is this?"
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={40}
             />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date</label>
             <input 
                type="date"
                className="w-full text-lg font-bold p-3 bg-white border-2 border-black/10 rounded-xl"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
             />
          </div>

          <div className="pt-4">
              <DoodleButton type="submit" className="w-full text-xl py-4" variant={sign === '+' ? 'primary' : 'danger'}>
                 {mode === 'add' ? (sign === '+' ? 'Add Money' : 'Track Expense') : 'Save Changes'}
              </DoodleButton>
          </div>
      </form>
    </div>
  );

  if (view !== 'list') {
      return renderForm(view);
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
        {/* Header Card */}
        <div className="bg-white rounded-[2rem] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-6 flex flex-col items-center justify-center bg-emerald-50 text-center">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Balance</span>
                <h2 className={`text-5xl font-black font-[Patrick_Hand] tracking-tight ${total < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {formatCurrency(total)}
                </h2>
            </div>
            {/* Quick Add Bar */}
            <div className="p-3 bg-white border-t-2 border-black/10">
                <DoodleButton onClick={handleStartAdd} className="w-full flex items-center justify-center gap-2 py-3 !text-lg !rounded-xl">
                    <Plus size={24} strokeWidth={3} /> Add Entry
                </DoodleButton>
            </div>
        </div>

        {/* List */}
        <div className="space-y-2">
            {sortedEntries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300 opacity-60">
                    <div className="text-6xl mb-2">💸</div>
                    <p className="font-bold text-xl font-[Patrick_Hand]">No records yet</p>
                </div>
            )}

            {sortedEntries.map(entry => {
                const isIncome = entry.amount >= 0;
                return (
                    <div key={entry.id} className="group flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-black/5 hover:border-black/20 transition-all shadow-sm">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-black font-bold text-lg shrink-0 ${isIncome ? 'bg-[#86efac]' : 'bg-red-200'}`}>
                            {isIncome ? '+' : '-'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg leading-none truncate">{entry.note}</div>
                            <div className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                                <Calendar size={10} /> {getRelativeDate(entry.timestamp)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-bold font-mono text-lg ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(entry.amount)}
                            </div>
                            
                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleStartEdit(entry)} className="text-gray-400 hover:text-black"><Pencil size={12} /></button>
                                <button onClick={() => { if(confirm("Delete this?")) onDelete(entry.id) }} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
