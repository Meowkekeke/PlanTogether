
import React, { useState } from 'react';
import { Activity, ActivityNature, RoomData, MoneyEntry } from '../types';
import { DoodleButton } from './DoodleButton';
import { Plus, BarChart3, X, Trash2, ArrowLeft, User, Trophy, Calendar, CheckCircle2, Repeat, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { addMoneyEntry, editMoneyEntry, deleteMoneyEntry } from '../services/db';
import { MoneyView } from './MoneyView';

interface TrackerTabProps {
  activities: Activity[];
  userId: string;
  roomData: RoomData; 
  partnerName: string;
  onAddActivity: (title: string, nature: ActivityNature, projectUnit?: string) => void;
  onLogOccurrence: (activityId: string, details: { timestamp: number, durationMinutes?: number, quantity?: number, note?: string, isMilestone?: boolean }) => void;
  onDeleteActivity: (activity: Activity) => void;
}

export const TrackerTab: React.FC<TrackerTabProps> = ({ 
  activities, 
  userId, 
  roomData,
  partnerName,
  onAddActivity, 
  onLogOccurrence,
  onDeleteActivity 
}) => {
  const [view, setView] = useState<'board' | 'create' | 'log' | 'summary' | 'money'>('board');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newNature, setNewNature] = useState<ActivityNature>('ongoing');
  const [newProjectUnit, setNewProjectUnit] = useState('');
  
  // Logging States
  const [logDetails, setLogDetails] = useState({
    timeOffset: 'now', // 'now' | 'earlier' | 'yesterday'
    isMilestone: false,
  });

  // Summary State
  const [summaryType, setSummaryType] = useState<'monthly' | 'annual'>('monthly');

  // Money Helpers
  const moneyEntries = roomData.money || [];
  const moneyTotal = moneyEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const lastMoneyUpdate = moneyEntries.length > 0 
    ? Math.max(...moneyEntries.map(e => e.timestamp)) 
    : 0;

  const getRelativeTime = (ts: number) => {
    if (ts === 0) return 'No activity';
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return 'Today';
    if (hours < 48) return 'Yesterday';
    return new Date(ts).toLocaleDateString();
  };
  
  // --- Helpers ---
  const getStats = (activity: Activity) => {
    // Robust check for missing logs
    const logs = activity.logs || [];
    const myLogs = logs.filter(l => l.userId === userId);
    const partnerLogs = logs.filter(l => l.userId !== userId);
    
    return {
        me: {
            sessions: myLogs.length,
            projects: myLogs.filter(l => l.isMilestone).length
        },
        partner: {
            sessions: partnerLogs.length,
            projects: partnerLogs.filter(l => l.isMilestone).length
        }
    };
  };

  // --- Handlers ---
  const startCreate = () => {
    setNewTitle('');
    setNewNature('ongoing');
    setNewProjectUnit('');
    setView('create');
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddActivity(newTitle, newNature, newProjectUnit);
    setView('board');
  };

  const startLog = (activity: Activity) => {
    setSelectedActivity(activity);
    setLogDetails({ timeOffset: 'now', isMilestone: false });
    setView('log');
  };

  const submitLog = () => {
    if (!selectedActivity) return;
    
    let timestamp = Date.now();
    if (logDetails.timeOffset === 'earlier') timestamp -= 1000 * 60 * 60 * 2; // Approx 2 hours ago
    if (logDetails.timeOffset === 'yesterday') timestamp -= 1000 * 60 * 60 * 24;

    onLogOccurrence(selectedActivity.id, {
      timestamp,
      isMilestone: logDetails.isMilestone
    });
    
    setView('board');
    setSelectedActivity(null);
  };

  // Safe fallback for roomCode access
  const roomCode = localStorage.getItem('lovesync_code');

  const handleAddMoney = async (amount: number, note: string, date: number) => {
      if(roomCode) await addMoneyEntry(roomCode, userId, amount, note, date);
  };
  const handleEditMoney = async (id: string, updates: Partial<MoneyEntry>) => {
      if(roomCode) await editMoneyEntry(roomCode, id, updates);
  };
  const handleDeleteMoney = async (id: string) => {
      if(roomCode) await deleteMoneyEntry(roomCode, id);
  };

  // --- Render Views ---

  const renderCreate = () => (
    <div className="bg-white p-6 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">New Activity</h2>
        <button onClick={() => setView('board')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X /></button>
      </div>

      <form onSubmit={submitCreate} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">What is it?</label>
          <input 
            autoFocus
            className="w-full text-2xl font-bold border-b-4 border-black/10 focus:border-black focus:outline-none bg-transparent py-2 placeholder-gray-300"
            placeholder="e.g. Book Club, Gym, Art..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Tracking Type</label>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setNewNature('ongoing')}
              className={`p-4 rounded-xl border-4 text-left transition-all flex items-start gap-4 ${newNature === 'ongoing' ? 'bg-[#fffbeb] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-100 text-gray-400'}`}
            >
              <div className={`p-2 rounded-full border-2 ${newNature === 'ongoing' ? 'bg-[#fde047] border-black' : 'border-gray-200'}`}>
                <Repeat size={20} />
              </div>
              <div>
                  <div className="font-bold text-lg">Continuous Project</div>
                  <div className="text-xs font-bold opacity-60 mt-1">
                      Something you work on over time and eventually finish (e.g. Reading a Book, Knitting).
                  </div>
              </div>
            </button>
            
            {newNature === 'ongoing' && (
              <div className="animate-in fade-in slide-in-from-top-2 bg-[#fde047]/10 p-3 rounded-xl border-l-4 border-[#fde047]">
                 <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">What do you complete?</label>
                 <input 
                    className="w-full text-lg font-bold border-b-2 border-black/10 focus:border-black focus:outline-none bg-transparent py-1 placeholder-gray-300"
                    placeholder="e.g. Book, Painting, Course..."
                    value={newProjectUnit}
                    onChange={e => setNewProjectUnit(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 font-bold mt-1">We'll count how many <span className="text-black underline decoration-wavy decoration-[#fde047]">{newProjectUnit ? newProjectUnit + 's' : 'items'}</span> you finish!</p>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setNewNature('session')}
              className={`p-4 rounded-xl border-4 text-left transition-all flex items-start gap-4 ${newNature === 'session' ? 'bg-[#eff6ff] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-100 text-gray-400'}`}
            >
              <div className={`p-2 rounded-full border-2 ${newNature === 'session' ? 'bg-[#93c5fd] border-black' : 'border-gray-200'}`}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                  <div className="font-bold text-lg">Single Session</div>
                  <div className="text-xs font-bold opacity-60 mt-1">
                      Something you just "do" without a specific completion goal (e.g. Workout, Meditation).
                  </div>
              </div>
            </button>
          </div>
        </div>

        <DoodleButton type="submit" className="w-full">Create Card</DoodleButton>
      </form>
    </div>
  );

  const renderLog = () => {
    const unitName = selectedActivity?.projectUnit || 'project';
    
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#fffbeb] w-full max-w-sm max-h-[90vh] flex flex-col rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
         
         {/* Header - Fixed */}
         <div className="p-6 pb-2 shrink-0 flex justify-between items-start">
             <div className="pr-8">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Logging</div>
                <h2 className="text-3xl font-bold break-words leading-tight">{selectedActivity?.title}</h2>
             </div>
             <button onClick={() => setView('board')} className="p-2 hover:bg-black/5 rounded-full"><X /></button>
         </div>

         {/* Scrollable Content */}
         <div className="overflow-y-auto p-6 pt-2 space-y-6">
             <div className="bg-white p-6 rounded-2xl border-2 border-black/10 text-center space-y-4">
                 
                 {/* Main Action */}
                 <DoodleButton onClick={submitLog} className="w-full py-4 text-2xl bg-[#86efac]">
                    +1 Session
                 </DoodleButton>
                 
                 {/* Project Completion Toggle - Only for 'ongoing' projects */}
                 {selectedActivity?.nature === 'ongoing' && (
                    <div className="pt-2 border-t-2 border-dashed border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors border-2 border-transparent hover:border-gray-100">
                            <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center transition-colors shrink-0 ${logDetails.isMilestone ? 'bg-[#fde047]' : 'bg-white'}`}>
                                {logDetails.isMilestone && <Trophy size={16} />}
                            </div>
                            <div className="text-left">
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={logDetails.isMilestone}
                                    onChange={e => setLogDetails({...logDetails, isMilestone: e.target.checked})}
                                />
                                <div className="font-bold text-sm">I finished a {unitName}!</div>
                                <div className="text-xs text-gray-400 font-bold leading-tight">(Check this to count it as complete)</div>
                            </div>
                        </label>
                    </div>
                 )}
             </div>

             {/* Time Adjust */}
             <div className="bg-white p-2 rounded-xl border-2 border-gray-100 flex justify-between gap-2 text-xs font-bold text-gray-400">
                <button onClick={() => setLogDetails({...logDetails, timeOffset: 'now'})} className={`flex-1 py-2 rounded-lg transition-colors ${logDetails.timeOffset === 'now' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Now</button>
                <button onClick={() => setLogDetails({...logDetails, timeOffset: 'earlier'})} className={`flex-1 py-2 rounded-lg transition-colors ${logDetails.timeOffset === 'earlier' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Earlier</button>
                <button onClick={() => setLogDetails({...logDetails, timeOffset: 'yesterday'})} className={`flex-1 py-2 rounded-lg transition-colors ${logDetails.timeOffset === 'yesterday' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Yesterday</button>
             </div>
         </div>
      </div>
    </div>
  )};

  const renderSummary = () => {
     const now = new Date();
     const currentYear = now.getFullYear();
     const currentMonth = now.getMonth();
     
     const monthName = now.toLocaleString('default', { month: 'long' });
     const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
     
     // 1. Calculate Money Summary
     const relevantMoney = moneyEntries.filter(e => {
         const d = new Date(e.timestamp);
         if (d.getFullYear() !== currentYear) return false;
         if (summaryType === 'monthly' && d.getMonth() !== currentMonth) return false;
         return true;
     });
     
     const income = relevantMoney.filter(e => (e.amount || 0) > 0).reduce((acc, curr) => acc + (curr.amount || 0), 0);
     const expense = relevantMoney.filter(e => (e.amount || 0) < 0).reduce((acc, curr) => acc + Math.abs(curr.amount || 0), 0);
     const net = income - expense;

     // 2. Activity Data
     const monthlyLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
     const annualLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

     const getChartData = (activity: Activity) => {
        const isMonthly = summaryType === 'monthly';
        const counts = new Array(isMonthly ? daysInMonth : 12).fill(0);
        let totalSessions = 0;
        let totalProjects = 0;

        // Safety check for logs
        const logs = activity.logs || [];

        logs.forEach(l => {
            const d = new Date(l.timestamp);
            // Only process logs from the current year
            if (d.getFullYear() === currentYear) {
                if (isMonthly) {
                    // Monthly View: Filter by current month
                    if (d.getMonth() === currentMonth) {
                        counts[d.getDate() - 1]++;
                        totalSessions++;
                        if (l.isMilestone) totalProjects++;
                    }
                } else {
                    // Annual View: Aggregate by month
                    counts[d.getMonth()]++;
                    totalSessions++;
                    if (l.isMilestone) totalProjects++;
                }
            }
        });
        const max = Math.max(...counts, 1); 
        return { counts, max, totalSessions, totalProjects };
     };
    
     // Check if ANY activity has data for the current view to show generic empty state
     const hasActivityData = (activities || []).some(a => {
         const { totalSessions } = getChartData(a);
         return totalSessions > 0;
     });
     
     const hasFinancialData = relevantMoney.length > 0;

     return (
         <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-2 mb-2">
                 <button onClick={() => setView('board')} className="p-2 bg-white rounded-full border-2 border-black hover:bg-gray-100"><ArrowLeft size={20}/></button>
                 <h2 className="text-2xl font-bold">{summaryType === 'monthly' ? monthName : currentYear} Recap</h2>
             </div>

             {/* Toggle */}
             <div className="flex bg-black/5 p-1 rounded-xl mb-4">
                <button 
                    onClick={() => setSummaryType('monthly')} 
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${summaryType === 'monthly' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {monthName}
                </button>
                <button 
                    onClick={() => setSummaryType('annual')} 
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${summaryType === 'annual' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {currentYear}
                </button>
             </div>

             <div className="space-y-6 pb-24">
                 
                 {/* MONEY SUMMARY CARD */}
                 <div className="bg-white p-5 rounded-3xl border-4 border-black shadow-sm">
                     <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                         <DollarSign className="text-emerald-500" /> Piggy Bank Recap
                     </h3>
                     
                     <div className="flex gap-4">
                         <div className="flex-1 bg-green-50 p-3 rounded-xl border border-green-100">
                             <div className="text-[10px] font-bold text-green-700 uppercase tracking-widest flex items-center gap-1 mb-1">
                                 <TrendingUp size={12} /> Income
                             </div>
                             <div className="text-2xl font-black font-[Patrick_Hand] text-green-600">
                                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(income)}
                             </div>
                         </div>
                         <div className="flex-1 bg-red-50 p-3 rounded-xl border border-red-100">
                             <div className="text-[10px] font-bold text-red-700 uppercase tracking-widest flex items-center gap-1 mb-1">
                                 <TrendingDown size={12} /> Expense
                             </div>
                             <div className="text-2xl font-black font-[Patrick_Hand] text-red-600">
                                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(expense)}
                             </div>
                         </div>
                     </div>
                     
                     <div className="mt-4 pt-4 border-t-2 border-black/5 flex justify-between items-center">
                         <span className="text-xs font-bold text-gray-400 uppercase">Net Flow</span>
                         <span className={`text-xl font-black ${net >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                              {net > 0 ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(net)}
                         </span>
                     </div>
                 </div>

                 {/* ACTIVITY CHARTS */}
                 {(activities || []).map(act => {
                     const { counts, max, totalSessions, totalProjects } = getChartData(act);
                     if(totalSessions === 0) return null;
                     
                     const labels = summaryType === 'monthly' ? monthlyLabels : annualLabels;
                     const unitNamePlural = (act.projectUnit ? act.projectUnit + 's' : 'Projects');

                     return (
                         <div key={act.id} className="bg-white p-5 rounded-3xl border-4 border-black shadow-sm">
                             <div className="flex flex-wrap justify-between items-baseline mb-6 gap-2">
                                 <h3 className="font-bold text-xl">{act.title}</h3>
                                 <div className="flex gap-3 text-xs font-bold">
                                     <span className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                         {totalSessions} Sessions
                                     </span>
                                     {act.nature === 'ongoing' && totalProjects > 0 && (
                                         <span className="bg-[#fef9c3] text-yellow-800 px-3 py-1.5 rounded-lg border border-yellow-200 flex items-center gap-1">
                                             <Trophy size={12} /> {totalProjects} {unitNamePlural} Finished
                                         </span>
                                     )}
                                 </div>
                             </div>
                             
                             {/* Bar Chart Container */}
                             <div className="relative h-40 w-full flex items-end gap-[2px] sm:gap-1.5 border-b-2 border-black/10 pb-1">
                                {/* Max line reference (optional, keeps chart readable) */}
                                <div className="absolute top-0 left-0 w-full border-t border-dashed border-gray-200 text-[9px] text-gray-300 font-bold">{max > 1 ? max : ''}</div>
                                
                                {counts.map((count, i) => {
                                    const heightPercent = (count / max) * 100;
                                    const label = labels[i];
                                    const isWeekend = summaryType === 'monthly' 
                                        ? new Date(currentYear, currentMonth, i + 1).getDay() % 6 === 0
                                        : false;
                                    
                                    return (
                                        <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                                            {/* Tooltip */}
                                            {count > 0 && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap font-bold pointer-events-none">
                                                    {summaryType === 'monthly' ? `Day ${label}` : label}: {count}
                                                </div>
                                            )}
                                            
                                            {/* Bar */}
                                            <div 
                                                className={`w-full min-w-[4px] rounded-t-sm transition-all duration-500 relative ${count > 0 ? 'bg-[#86efac] border-x border-t border-black/20' : 'bg-transparent'}`}
                                                style={{ height: count > 0 ? `${heightPercent}%` : '4px' }}
                                            >
                                                {/* Dot for 0 state to guide eye (Monthly) */}
                                                {count === 0 && summaryType === 'monthly' && (
                                                    <div className={`absolute bottom-0 left-0 w-full h-[2px] ${isWeekend ? 'bg-gray-300' : 'bg-gray-100'}`} />
                                                )}
                                                {/* Tick for 0 state (Annual) */}
                                                 {count === 0 && summaryType === 'annual' && (
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-[4px] bg-gray-200" />
                                                )}
                                            </div>
                                            
                                            {/* Axis Label */}
                                            {summaryType === 'monthly' ? (
                                                ((i + 1) === 1 || (i + 1) % 5 === 0) && (
                                                    <span className="text-[9px] text-gray-400 font-bold absolute -bottom-5 left-1/2 -translate-x-1/2">{label}</span>
                                                )
                                            ) : (
                                                <span className="text-[9px] text-gray-400 font-bold absolute -bottom-5 left-1/2 -translate-x-1/2">{label}</span>
                                            )}
                                        </div>
                                    )
                                })}
                             </div>
                         </div>
                     )
                 })}
                 
                 {!hasActivityData && !hasFinancialData && (
                     <EmptyState type="tracker" message="No data for this period" />
                 )}
             </div>
         </div>
     )
  };

  const renderBoard = () => (
    <>
       {/* Header Actions */}
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
             <h2 className="text-xl font-bold">Financial Tracker</h2>
             <button onClick={() => setView('summary')} className="p-1.5 bg-white border-2 border-black/10 rounded-lg hover:border-black transition-colors text-gray-400 hover:text-black" title="Monthly Summary">
                <BarChart3 size={16} />
             </button>
          </div>
       </div>

       {/* The Board Grid */}
       <div className="space-y-4 pb-24">
          
          {/* MONEY CARD - Always at top */}
          <div 
            onClick={() => setView('money')}
            className="w-full bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
          >
             <div className="bg-emerald-50 p-3 border-b-2 border-black/10 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-500 shrink-0" />
                    <h3 className="font-bold text-lg leading-tight text-emerald-900">Our Piggy Bank</h3>
                 </div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                     {getRelativeTime(lastMoneyUpdate)}
                 </div>
             </div>
             
             <div className="p-6 flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</div>
                    <div className={`text-4xl font-black font-[Patrick_Hand] ${moneyTotal < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(moneyTotal)}
                    </div>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full border-2 border-black">
                    <DollarSign size={24} className="text-emerald-700" />
                </div>
             </div>
          </div>


          {/* ACTIVITY CARDS */}
          {(activities || []).length === 0 ? (
              <EmptyState 
                type="tracker" 
                message="Track Activities" 
                subMessage="Finance is tracked above. Add hobbies here!"
              />
          ) : (
              (activities || []).map((activity, i) => {
                  const stats = getStats(activity);
                  const unitNamePlural = (activity.projectUnit ? activity.projectUnit + 's' : 'Projects');
                  
                  return (
                      <div 
                        key={activity.id}
                        className="w-full bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                      >
                         {/* Card Header */}
                         <div className="bg-yellow-50 p-3 border-b-2 border-black/10 flex justify-between items-center">
                             <div className="flex items-center gap-2 overflow-hidden">
                                {activity.nature === 'ongoing' ? <Repeat size={14} className="text-gray-400 shrink-0" /> : <CheckCircle2 size={14} className="text-gray-400 shrink-0" />}
                                <h3 className="font-bold text-lg leading-tight truncate">{activity.title}</h3>
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteActivity(activity); }}
                                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                             >
                                <Trash2 size={16} />
                             </button>
                         </div>

                         {/* Split Body */}
                         <div className="flex h-32">
                            {/* LEFT: ME */}
                            <div className="flex-1 border-r-2 border-black/10 flex flex-col items-center justify-center p-2 bg-green-50 relative">
                                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Me</span>
                                
                                <div className="flex gap-4 mb-2 text-center">
                                    <div>
                                        <div className="text-2xl font-black">{stats.me.sessions}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase">Sessions</div>
                                    </div>
                                    {/* Only show projects count if it's an ongoing project type */}
                                    {activity.nature === 'ongoing' && (
                                        <div>
                                            <div className="text-2xl font-black text-[#facc15]">{stats.me.projects}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase">{unitNamePlural}</div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => startLog(activity)}
                                    className="w-10 h-10 rounded-full bg-[#86efac] border-2 border-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                                >
                                    <Plus size={24} strokeWidth={3} />
                                </button>
                            </div>

                            {/* RIGHT: PARTNER */}
                            <div className="flex-1 flex flex-col items-center justify-center p-2 bg-blue-50 relative">
                                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate max-w-[80px]">{partnerName}</span>
                                
                                <div className="flex gap-4 mb-2 text-center opacity-60">
                                    <div>
                                        <div className="text-2xl font-black">{stats.partner.sessions}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase">Sessions</div>
                                    </div>
                                    {activity.nature === 'ongoing' && (
                                        <div>
                                            <div className="text-2xl font-black text-[#facc15]">{stats.partner.projects}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase">{unitNamePlural}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Visual placeholder for partner */}
                                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center opacity-30">
                                    <User size={20} className="text-gray-400" />
                                </div>
                            </div>
                         </div>
                      </div>
                  );
              })
          )}

          {/* Add Button Card */}
          <button 
            onClick={startCreate}
            className="w-full h-24 rounded-2xl border-4 border-black/10 border-dashed flex flex-col items-center justify-center gap-2 text-gray-300 hover:bg-black/5 hover:text-gray-500 transition-colors"
          >
              <Plus size={32} />
              <span className="font-bold">Add New Activity</span>
          </button>
       </div>
    </>
  );

  return (
    <div className="relative min-h-[60vh]">
       {view === 'board' && renderBoard()}
       {view === 'create' && renderCreate()}
       {view === 'log' && renderLog()}
       {view === 'summary' && renderSummary()}
       {view === 'money' && (
           <MoneyView 
              entries={moneyEntries}
              userId={userId}
              onAdd={handleAddMoney}
              onEdit={handleEditMoney}
              onDelete={handleDeleteMoney}
              onClose={() => setView('board')}
           />
       )}
    </div>
  );
};
