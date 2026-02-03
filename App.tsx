
import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Copy, LogOut, Cloud, Sun, Flower, Leaf, User, Users, Plus, Smile, BarChart3, ListTodo, Trophy, Settings, Trash2, RefreshCw, X, Eraser } from 'lucide-react';
import { 
  createRoom, joinRoom, subscribeToRoom, sendInteraction,
  addActivity, logActivityOccurrence, deleteActivity,
  addTodo, completeTodo, deleteTodo, togglePinTodo,
  addGoal, incrementGoal, deleteGoal,
  addSticky, deleteSticky, toggleStickyPin,
  addGroceryItem, toggleGroceryItem,
  deleteRoom, clearGardenData,
  getUUID
} from './services/db';
import { RoomData, InteractionType, ActivityNature, Activity, Goal } from './types';
import { DoodleButton } from './components/DoodleButton';
import { TrackerTab } from './components/TrackerTab';
import { ListTab } from './components/ListTab';
import { GoalTab } from './components/GoalTab';
import { HomeBoard } from './components/HomeBoard';
import { ConfirmModal } from './components/ConfirmModal';

// Utility for persistent User ID using robust UUID
const getUserId = () => {
  let id = localStorage.getItem('lovesync_uid');
  if (!id) {
    id = getUUID();
    localStorage.setItem('lovesync_uid', id);
  }
  return id;
};

const App: React.FC = () => {
  // Application State
  const [userId] = useState(getUserId());
  const [roomCode, setRoomCode] = useState<string | null>(localStorage.getItem('lovesync_code'));
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [userName, setUserName] = useState<string>(localStorage.getItem('lovesync_name') || '');
  
  // UI State
  const [mainTab, setMainTab] = useState<'mood' | 'track' | 'list' | 'goal'>('mood');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('lovesync_name'));
  const [showSettings, setShowSettings] = useState(false);
  
  // Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    isDanger?: boolean;
    confirmText?: string;
    singleButton?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Animation State
  const [animationType, setAnimationType] = useState<InteractionType | null>(null);
  const lastInteractionRef = useRef<number>(0);

  // Subscription Effect
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      setRoomData(data);

      // Handle Interactions
      if (data.lastInteraction) {
        const { timestamp, senderId, type } = data.lastInteraction;
        // Only animate if it's a new interaction and NOT sent by me
        if (timestamp > lastInteractionRef.current && senderId !== userId) {
          triggerAnimation(type);
          lastInteractionRef.current = timestamp;
        } 
        // Sync ref on initial load to avoid playing old animations
        else if (lastInteractionRef.current === 0) {
            lastInteractionRef.current = timestamp;
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, userId]);

  const triggerAnimation = (type: InteractionType) => {
    setAnimationType(type);
    setTimeout(() => setAnimationType(null), 3000);
  };

  // Helpers
  const getPartnerName = () => {
    if (!roomData) return 'Partner';
    const isHost = roomData.hostId === userId;
    const partnerName = isHost ? roomData.guestState?.name : roomData.hostState?.name;
    return partnerName && partnerName !== 'Waiting for partner...' ? partnerName : 'Partner';
  };

  // Safe name resolver for HomeBoard
  const getUserName = (id: string) => {
    if (!roomData) return 'Unknown';
    if (id === userId) return "Me";
    if (id === roomData.hostId) return roomData.hostState.name || 'Partner';
    if (id === roomData.guestId) return roomData.guestState.name || 'Partner';
    return 'Partner';
  };

  const showAlert = (title: string, message: string) => {
      setConfirmConfig({
          isOpen: true,
          title,
          message,
          onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false })),
          singleButton: true,
          confirmText: 'Okay!'
      });
  };

  const requestConfirm = (title: string, message: React.ReactNode, action: () => void, isDanger = false, confirmText = "Yes") => {
    setConfirmConfig({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
            action();
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        },
        isDanger,
        confirmText,
        singleButton: false
    });
  };

  // Actions
  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      setShowNameModal(true);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const code = await createRoom(userId, userName);
      localStorage.setItem('lovesync_code', code);
      setRoomCode(code);
    } catch (err) {
      setError('Failed to create room. Try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    if (!userName.trim()) {
      setShowNameModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    const code = inputCode.toUpperCase().trim();
    
    try {
      const success = await joinRoom(code, userId, userName);
      if (success) {
        localStorage.setItem('lovesync_code', code);
        setRoomCode(code);
      } else {
        setError('Room not found or full!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
      localStorage.removeItem('lovesync_code');
      setRoomCode(null);
      setRoomData(null);
      setShowSettings(false);
  };

  const handleDeleteRoom = async () => {
    requestConfirm(
        "Delete Garden?", 
        "Are you sure? This will delete the garden and all data forever for BOTH of you.", 
        async () => {
            if (roomCode) {
                await deleteRoom(roomCode);
                handleDisconnect();
            }
        }, 
        true,
        "Delete Forever"
    );
  };

  const handleClearRecords = () => {
      requestConfirm(
          "WIPE ENTIRE GARDEN?", 
          <div className="space-y-2 text-left">
              <p>This will <b>permanently delete</b>:</p>
              <ul className="list-disc pl-5 text-sm">
                  <li>All Stickies (Yours & Partner's)</li>
                  <li>All Lists & Completed Items</li>
                  <li>All Tracker Activities & History</li>
                  <li>All Goals & Rewards</li>
              </ul>
              <p className="pt-2 font-bold text-red-600">This cannot be undone. Are you absolutely sure?</p>
          </div>,
          async () => {
            if (roomCode) {
               try {
                  await clearGardenData(roomCode);
                  showAlert("Garden Reset", "The garden has been cleared fresh.");
               } catch (e) {
                  console.error(e);
                  showAlert("Error", "Could not reset garden.");
               }
            }
          },
          true,
          "YES, WIPE EVERYTHING"
      );
  };

  const saveName = () => {
    if (userName.trim()) {
      localStorage.setItem('lovesync_name', userName);
      setShowNameModal(false);
    }
  };

  const copyCode = async () => {
    if (roomCode) {
      try {
        await navigator.clipboard.writeText(roomCode);
        showAlert('Copied!', 'Code copied to clipboard. Send it to your partner! 💌');
      } catch (e) {
        prompt("Copy this code and send it to your partner:", roomCode);
      }
    }
  };

  // --- Feature Handlers ---
  const handleAddSticky = async (type: any, content: any) => {
    if (!roomCode) return;
    await addSticky(roomCode, userId, type, content);
  };

  const handleDeleteSticky = async (id: string) => {
    if (!roomCode) return;
    await deleteSticky(roomCode, id);
  };
  
  const handleToggleStickyPin = async (id: string) => {
      if (!roomCode) return;
      await toggleStickyPin(roomCode, userId, id);
  };

  const handleClaimReward = async (reward: string) => {
    if (!roomCode) return;
    requestConfirm(
        "Claim Reward!", 
        <span>Claim <b>"{reward}"</b>? This will add it to your "WE" list.</span>,
        async () => {
             // Goals claim into "List" as items that need to happen
             await addTodo(roomCode, `Reward: ${reward}`, 'list', null);
             setMainTab('list');
        },
        false,
        "Claim It!"
    );
  };

  // --- Tracker Handlers ---
  const handleAddActivity = async (title: string, nature: ActivityNature, projectUnit?: string) => {
    if (!roomCode) return;
    await addActivity(roomCode, userId, title, nature, projectUnit);
  };

  const handleLogOccurrence = async (activityId: string, details: any) => {
    if (!roomCode) return;
    await logActivityOccurrence(roomCode, activityId, userId, details);
  };

  const handleDeleteActivity = async (activity: Activity) => {
    if (!roomCode) return;
    requestConfirm(
        "Delete Activity?",
        `Remove "${activity.title}" and all its history?`,
        async () => {
            await deleteActivity(roomCode, activity);
        },
        true,
        "Remove"
    );
  };
  
  const handleDeleteGoal = async (goal: Goal) => {
      if (!roomCode) return;
       requestConfirm(
        "Delete Goal?",
        `Remove "${goal.title}"?`,
        async () => {
            await deleteGoal(roomCode, goal);
        },
        true,
        "Remove"
    );
  };


  // --- Render Logic ---

  const BackgroundDoodles = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <Cloud className="absolute top-10 left-[-20px] text-white/60 w-32 h-32 animate-pulse" style={{ animationDuration: '4s' }} />
      <Cloud className="absolute top-40 right-[-40px] text-white/60 w-40 h-40 animate-pulse" style={{ animationDuration: '6s' }} />
      <Sun className="absolute top-8 right-8 text-[#fde047]/40 w-24 h-24 animate-spin-slow" style={{ animationDuration: '10s' }} />
      <Flower className="absolute bottom-10 left-10 text-[#fca5a5]/40 w-16 h-16 animate-bounce" style={{ animationDuration: '3s' }} />
      <Leaf className="absolute bottom-20 right-20 text-[#86efac]/40 w-20 h-20 rotate-45" />
    </div>
  );

  const InteractionOverlay = () => {
    if (!animationType) return null;
    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            {animationType === 'love' && (
                <>
                  {[...Array(20)].map((_, i) => (
                      <div key={i} className="absolute text-5xl animate-float-up" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.5}s` }}>❤️</div>
                  ))}
                </>
            )}
            {animationType === 'water' && (
                 <>
                 {[...Array(30)].map((_, i) => (
                     <div key={i} className="absolute text-4xl animate-rain" style={{ left: `${Math.random() * 100}%`, top: '-10%', animationDelay: `${Math.random()}s` }}>💧</div>
                 ))}
               </>
            )}
             {animationType === 'sun' && (
                 <div className="absolute inset-0 bg-yellow-100/50 flex items-center justify-center animate-sun-pulse">
                     <Sun size={200} className="text-yellow-500 fill-yellow-300" />
                 </div>
            )}
             {animationType === 'poke' && (
                <div className="text-9xl animate-bounce">👉</div>
             )}
        </div>
    );
  };

  // 1. Name Entry Modal
  if (showNameModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <BackgroundDoodles />
        <div className="bg-white w-full max-w-sm p-8 rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative z-10">
          <Sprout className="w-20 h-20 text-[#86efac] mx-auto mb-4 fill-current animate-bounce stroke-black stroke-2" />
          <h1 className="text-4xl font-bold mb-2">Hello!</h1>
          <p className="mb-6 text-gray-600 text-xl">What's your name?</p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Honey Bun 🍯"
            className="w-full p-4 border-4 border-black rounded-2xl mb-6 text-center text-xl outline-none focus:ring-4 ring-[#86efac]/50 shadow-inner bg-gray-50"
          />
          <DoodleButton onClick={saveName} className="w-full">Let's Go!</DoodleButton>
        </div>
      </div>
    );
  }

  // 2. Landing Page (No Room)
  if (!roomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto relative overflow-hidden">
        <BackgroundDoodles />
        <div className="mb-10 transform -rotate-2 relative z-10">
            <h1 className="text-7xl font-bold text-[#86efac] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black tracking-wider" style={{ WebkitTextStroke: '2px black' }}>LoveSync</h1>
            <p className="text-2xl mt-3 font-bold text-gray-800 bg-white/80 inline-block px-4 py-1 rounded-full border-2 border-black rotate-2">
                Grow Together 🌱
            </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full space-y-8 relative z-10">
           {error && (
             <div className="bg-[#fca5a5] border-4 border-black text-black p-3 rounded-xl font-bold animate-shake">{error}</div>
           )}

           <div>
             <DoodleButton onClick={handleCreateRoom} disabled={isLoading} className="w-full text-2xl py-5 rounded-2xl">
               {isLoading ? 'Planting Seeds...' : 'Create New Garden'}
             </DoodleButton>
             <p className="text-base text-gray-500 mt-3 font-bold">Start a new space for you two</p>
           </div>

           <div className="relative flex items-center justify-center py-2">
             <div className="border-t-4 border-black/10 w-full absolute border-dashed"></div>
             <div className="bg-white px-4 relative z-10 font-bold text-xl text-gray-400 rotate-12">OR</div>
           </div>

           <div>
             <input
               type="text"
               value={inputCode}
               onChange={(e) => setInputCode(e.target.value)}
               placeholder="ENTER CODE"
               className="w-full p-5 text-center text-3xl tracking-[0.5em] uppercase border-4 border-black rounded-2xl mb-4 focus:outline-none focus:ring-4 ring-[#fde047]/50 font-mono bg-[#fdf6e3]"
               maxLength={6}
             />
             <DoodleButton onClick={handleJoinRoom} variant="secondary" disabled={isLoading} className="w-full">
                {isLoading ? 'Finding...' : 'Join Partner'}
             </DoodleButton>
           </div>
        </div>
      </div>
    );
  }

  // 3. Dashboard (In Room)
  if (!roomData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fefce8] gap-4">
        {/* Doodle Spinner */}
        <div className="relative">
           {/* Spinning rays */}
           <Sun size={80} className="text-black animate-[spin_3s_linear_infinite]" strokeWidth={2} />
           {/* Center face */}
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-10 h-10 bg-[#fde047] rounded-full border-2 border-black flex items-center justify-center gap-1">
                 <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
           </div>
        </div>
        <div className="font-bold text-gray-400 text-lg animate-pulse">Loading Garden...</div>
      </div>
    );
  }

  // Helper for safe money total
  const moneyTotal = (roomData.money || []).reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="min-h-screen flex flex-col max-w-md md:max-w-2xl mx-auto relative bg-[#fefce8]">
      <BackgroundDoodles />
      <InteractionOverlay />
      
      {/* Global Confirmation Modal */}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmConfig.isDanger}
        confirmText={confirmConfig.confirmText}
        singleButton={confirmConfig.singleButton}
      />

      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#fefce8]/95 backdrop-blur-sm p-3 border-b-2 border-black/5">
        <div className="flex justify-between items-center bg-white p-2 rounded-2xl border-2 border-black shadow-sm">
            <div className="flex items-center gap-2">
            <div className="bg-[#86efac] p-1.5 rounded-lg border-2 border-black">
                <Sprout className="text-black w-4 h-4" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">LoveSync</h1>
            
            </div>
            
            <div className="flex items-center gap-2">
            <button 
                onClick={copyCode}
                className="flex items-center gap-1 px-3 py-1 bg-[#fde047] hover:bg-[#facc15] border-2 border-black rounded-lg text-xs font-bold transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
                <span className="font-mono">{roomCode}</span>
                <Copy size={12} />
            </button>
            <button 
                onClick={() => setShowSettings(true)} 
                className="p-1.5 bg-white hover:bg-gray-100 border-2 border-black rounded-lg text-black transition-colors active:translate-y-[1px]"
            >
                <Settings size={14} />
            </button>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 relative z-10">
        
        {/* --- TAB 1: HOME (Sticky Board) --- */}
        {mainTab === 'mood' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-2 px-2">
                   <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shared Board</span>
                   </div>
                   {/* Legend */}
                   <div className="flex gap-3 text-[10px] font-bold">
                       <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#86efac] border border-black rounded-full"></div> Me</div>
                       <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#93c5fd] border border-black rounded-full"></div> {getPartnerName()}</div>
                   </div>
                </div>

                <HomeBoard 
                   stickies={roomData.stickies || []}
                   groceries={roomData.groceries || []}
                   userId={userId}
                   moneyTotal={moneyTotal}
                   getUserName={getUserName}
                   onAddSticky={handleAddSticky}
                   onDeleteSticky={handleDeleteSticky}
                   onTogglePin={handleToggleStickyPin}
                   onAddGrocery={(text) => roomCode && addGroceryItem(roomCode, text)}
                   onToggleGrocery={(id) => roomCode && toggleGroceryItem(roomCode, id)}
                />
            </div>
        )}

        {/* --- TAB 2: TRACKER --- */}
        {mainTab === 'track' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
                <TrackerTab 
                    activities={roomData.activities || []}
                    userId={userId}
                    roomData={roomData}
                    partnerName={getPartnerName()}
                    onAddActivity={handleAddActivity}
                    onLogOccurrence={handleLogOccurrence}
                    onDeleteActivity={handleDeleteActivity}
                />
            </div>
        )}

        {/* --- TAB 3: TOGETHER --- */}
        {mainTab === 'list' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
                <ListTab 
                    todos={roomData.todos || []}
                    onAdd={(text, category, deadline) => addTodo(roomCode!, text, category, deadline)}
                    onComplete={(id) => completeTodo(roomCode!, id, roomData.todos || [])}
                    onDelete={(todo) => deleteTodo(roomCode!, todo)}
                    onPin={(id) => togglePinTodo(roomCode!, userId, id)}
                />
            </div>
        )}

        {/* --- TAB 4: GOAL --- */}
        {mainTab === 'goal' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
                <GoalTab 
                    goals={roomData.goals || []}
                    onAdd={(title, target, reward) => addGoal(roomCode!, title, target, reward)}
                    onIncrement={(id) => incrementGoal(roomCode!, id, roomData.goals || [])}
                    onDelete={handleDeleteGoal}
                    onClaim={handleClaimReward}
                />
            </div>
        )}

      </main>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black p-2 z-40 max-w-md md:max-w-2xl mx-auto rounded-t-3xl shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.1)]">
         <div className="flex justify-around items-center">
            <button onClick={() => setMainTab('mood')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${mainTab === 'mood' ? 'text-black scale-110' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full border-2 ${mainTab === 'mood' ? 'bg-[#fde047] border-black' : 'border-transparent'}`}>
                    <Smile size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold">Home</span>
            </button>
            
            <button onClick={() => setMainTab('track')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${mainTab === 'track' ? 'text-black scale-110' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full border-2 ${mainTab === 'track' ? 'bg-[#86efac] border-black' : 'border-transparent'}`}>
                    <BarChart3 size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold">Tracker</span>
            </button>

            <button onClick={() => setMainTab('list')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${mainTab === 'list' ? 'text-black scale-110' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full border-2 ${mainTab === 'list' ? 'bg-[#93c5fd] border-black' : 'border-transparent'}`}>
                    <ListTodo size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold">Together</span>
            </button>

            <button onClick={() => setMainTab('goal')} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${mainTab === 'goal' ? 'text-black scale-110' : 'text-gray-400'}`}>
                <div className={`p-2 rounded-full border-2 ${mainTab === 'goal' ? 'bg-[#fca5a5] border-black' : 'border-transparent'}`}>
                    <Trophy size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold">Goal</span>
            </button>
         </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="p-6 border-b-2 border-black/10 flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Settings</h2>
                      <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      
                      {/* Leave */}
                      <button 
                        onClick={handleDisconnect}
                        className="w-full p-4 rounded-xl border-2 border-black flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                          <div className="bg-white p-2 rounded-lg border border-black"><LogOut size={20} /></div>
                          <div>
                              <div className="font-bold">Leave Garden</div>
                              <div className="text-xs text-gray-500">Disconnect from this device.</div>
                          </div>
                      </button>

                      {/* Clear Records */}
                      <button 
                        onClick={handleClearRecords}
                        className="w-full p-4 rounded-xl border-2 border-black flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                          <div className="bg-yellow-100 p-2 rounded-lg border border-black"><Eraser size={20} className="text-yellow-700" /></div>
                          <div>
                              <div className="font-bold">Clear Records</div>
                              <div className="text-xs text-gray-500">Delete all memory (both users).</div>
                          </div>
                      </button>

                       {/* Delete */}
                       <button 
                        onClick={handleDeleteRoom}
                        className="w-full p-4 rounded-xl border-2 border-red-200 bg-red-50 flex items-center gap-3 hover:bg-red-100 transition-colors text-left"
                      >
                          <div className="bg-red-200 p-2 rounded-lg border border-black"><Trash2 size={20} className="text-red-700" /></div>
                          <div>
                              <div className="font-bold text-red-800">Delete Garden</div>
                              <div className="text-xs text-red-600">Destroy all data forever.</div>
                          </div>
                      </button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 text-center text-xs font-bold text-gray-400">
                      LoveSync v1.0 • Built with ❤️
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
