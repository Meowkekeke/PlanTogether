import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, Unsubscribe, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { RoomData, Mood, UserState, InteractionType, MoodEntry, Habit, TodoItem, Goal, HabitType, TogetherCategory, Activity, ActivityNature, ActivityLog, Sticky, StickyType, Signal } from '../types';

const ROOM_COLLECTION = 'couple_rooms';

// Robust UUID generator that works in non-secure contexts
export const getUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate a random 6-character code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const initialUserState: UserState = {
  name: 'Anonymous',
  mood: Mood.HAPPY,
  note: 'Just joined!',
  lastUpdated: Date.now(),
};

export const createRoom = async (userId: string, userName: string): Promise<string> => {
  const code = generateRoomCode();
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  // Ensure we use the safe UUID generator
  const initialData: RoomData = {
    hostId: userId,
    hostState: { ...initialUserState, name: userName },
    guestState: { ...initialUserState, name: 'Waiting for partner...' },
    createdAt: Date.now(),
    logs: [],
    stickies: [], // New Home Board
    activities: [], 
    habits: [],
    todos: [],
    goals: []
  };

  await setDoc(roomRef, initialData);
  return code;
};

export const joinRoom = async (code: string, userId: string, userName: string): Promise<boolean> => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    return false;
  }

  const data = roomSnap.data() as RoomData;

  // If I am the host, just return true (re-joining my own room)
  if (data.hostId === userId) return true;

  // If room is full (has a guest that isn't me)
  if (data.guestId && data.guestId !== userId) throw new Error("Room is full!");

  // If I am a new guest or re-joining as guest
  if (!data.guestId || data.guestId === userId) {
     await updateDoc(roomRef, {
      guestId: userId,
      'guestState.name': userName,
      'guestState.lastUpdated': Date.now()
    });
  }
  return true;
};

export const subscribeToRoom = (code: string, callback: (data: RoomData) => void): Unsubscribe => {
  return onSnapshot(doc(db, ROOM_COLLECTION, code), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as RoomData);
    }
  });
};

export const deleteRoom = async (code: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await deleteDoc(roomRef);
};

// --- CLEAR GARDEN DATA (RESET) ---
export const clearGardenData = async (code: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  
  const data = snap.data() as RoomData;

  // Hard Reset: Create a fresh object preserving only connection info
  // This overwrites any existing arrays, effectively deleting all records.
  const freshData: RoomData = {
    hostId: data.hostId,
    guestId: data.guestId, // Keep guest connection
    hostState: {
      name: data.hostState.name,
      mood: Mood.HAPPY, // Reset mood
      note: '', // Reset note
      lastUpdated: Date.now()
    },
    guestState: {
      name: data.guestState?.name || 'Partner',
      mood: Mood.HAPPY, // Reset mood
      note: '', // Reset note
      lastUpdated: Date.now()
    },
    createdAt: data.createdAt,
    // Clear all content collections
    logs: [],
    stickies: [],
    activities: [],
    habits: [],
    todos: [],
    goals: []
  };
  
  // Use setDoc to completely overwrite the document, ensuring no stray fields remain
  await setDoc(roomRef, freshData);
};

// --- NEW HOME: STICKIES ---
export const addSticky = async (code: string, userId: string, type: StickyType, content: { mood?: Mood, text?: string, signal?: Signal }) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;

  const data = roomSnap.data() as RoomData;
  let currentStickies = data.stickies || [];
  const now = Date.now();

  // 1. Cleanup Expired (Older than 4h) AND NOT PINNED
  const timeLimit = now - (4 * 60 * 60 * 1000);
  currentStickies = currentStickies.filter(s => s.isPinned || s.timestamp > timeLimit);

  // 2. Logic based on type
  if (type === 'mood') {
    // Replace user's existing mood sticky (unless pinned, then create new? No, usually unpin old)
    // Simple rule: Remove unpinned mood stickies for user to avoid clutter
    currentStickies = currentStickies.filter(s => !(s.userId === userId && s.type === 'mood' && !s.isPinned));
  } else if (type === 'note') {
    // Keep max 2 unpinned notes per user
    const myNotes = currentStickies.filter(s => s.userId === userId && s.type === 'note' && !s.isPinned).sort((a, b) => a.timestamp - b.timestamp);
    if (myNotes.length >= 2) {
      const idToRemove = myNotes[0].id; // Oldest
      currentStickies = currentStickies.filter(s => s.id !== idToRemove);
    }
  } else if (type === 'signal') {
    if (content.signal) {
      currentStickies = currentStickies.filter(s => !(s.userId === userId && s.type === 'signal' && s.signal === content.signal));
    }
  }

  // 3. Create new Sticky
  const newSticky: Sticky = {
    id: getUUID(),
    userId,
    type,
    timestamp: now,
    rotation: Math.floor(Math.random() * 12) - 6, // More random rotation
    isPinned: false, // Default not pinned
    ...content
  };

  currentStickies.push(newSticky);

  await updateDoc(roomRef, { stickies: currentStickies });
};

export const deleteSticky = async (code: string, stickyId: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const currentStickies = (roomSnap.data() as RoomData).stickies || [];
  
  await updateDoc(roomRef, { 
    stickies: currentStickies.filter(s => s.id !== stickyId) 
  });
};

// Toggle Pin for a generic sticky on the board
export const toggleStickyPin = async (code: string, userId: string, stickyId: string) => {
    const roomRef = doc(db, ROOM_COLLECTION, code);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    const currentStickies = (roomSnap.data() as RoomData).stickies || [];
    
    // Find the sticky we want to toggle
    const targetSticky = currentStickies.find(s => s.id === stickyId);
    if (!targetSticky) return;

    const willBePinned = !targetSticky.isPinned;

    const updatedStickies = currentStickies.map(s => {
        // 1. Update target
        if (s.id === stickyId) {
            return { ...s, isPinned: willBePinned, timestamp: Date.now() }; // Update timestamp to keep it fresh
        }
        // 2. If turning ON, Unpin all other stickies by this user
        if (willBePinned && s.userId === userId && s.isPinned) {
            return { ...s, isPinned: false };
        }
        return s;
    });
    
    // Also, if we unpinned a Sticky that came from a Todo (has originId), we should sync the Todo state
    // But Todo state is handled in togglePinTodo. Here we primarily handle Home stickies.
    // If the sticky has an originId, and we unpin it, we should find that Todo and set its isPinned to false.
    if (!willBePinned && targetSticky.originId) {
        const currentTodos = (roomSnap.data() as RoomData).todos || [];
        const updatedTodos = currentTodos.map(t => 
            t.id === targetSticky.originId ? { ...t, isPinned: false } : t
        );
        await updateDoc(roomRef, { todos: updatedTodos });
    }

    await updateDoc(roomRef, { stickies: updatedStickies });
};


// Deprecated (Kept to not break existing calls immediately, but effectively unused by new UI)
export const logMood = async (code: string, userId: string, userName: string, mood: Mood, note: string) => {
    // Map legacy logMood calls to new Sticky Mood system
    await addSticky(code, userId, 'mood', { mood, text: note });
};

export const sendInteraction = async (code: string, userId: string, type: InteractionType) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, {
    lastInteraction: { type, senderId: userId, timestamp: Date.now() }
  });
};

// --- NEW TRACKER (ACTIVITIES) ---
export const addActivity = async (code: string, userId: string, title: string, nature: ActivityNature, projectUnit?: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const activity: Activity = {
    id: getUUID(),
    ownerId: userId,
    title,
    nature,
    logs: [],
    createdAt: Date.now()
  };
  if (projectUnit) activity.projectUnit = projectUnit;
  await updateDoc(roomRef, { activities: arrayUnion(activity) });
};

export const logActivityOccurrence = async (
  code: string, 
  activityId: string, 
  userId: string, 
  details: { timestamp: number, durationMinutes?: number, quantity?: number, note?: string, isMilestone?: boolean }
) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  
  const currentActivities = (roomSnap.data() as RoomData).activities || [];
  
  const newLog: ActivityLog = {
    id: getUUID(),
    userId,
    timestamp: details.timestamp,
  };
  if (details.durationMinutes) newLog.durationMinutes = details.durationMinutes;
  if (details.quantity) newLog.quantity = details.quantity;
  if (details.note) newLog.note = details.note;
  if (details.isMilestone) newLog.isMilestone = details.isMilestone;

  const updatedActivities = currentActivities.map(a => {
    if (a.id === activityId) {
      return { ...a, logs: [...a.logs, newLog] };
    }
    return a;
  });

  await updateDoc(roomRef, { activities: updatedActivities });
};

export const deleteActivity = async (code: string, activity: Activity) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, { activities: arrayRemove(activity) });
};

// --- TOGETHER (List/Random) ---
export const addTodo = async (code: string, text: string, category: TogetherCategory, deadline?: number | null) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  const todo: TodoItem = {
    id: getUUID(),
    text,
    category,
    createdAt: Date.now()
  };

  if (category === 'list') {
      todo.deadline = deadline || null;
  }

  await updateDoc(roomRef, { todos: arrayUnion(todo) });
};

// Replaces toggleTodo - moves item to completed folder
export const completeTodo = async (code: string, todoId: string, currentTodos: TodoItem[]) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  // When completing, remove pinned status too
  const updatedTodos = currentTodos.map(t => 
    t.id === todoId ? { ...t, completedAt: Date.now(), isPinned: false } : t
  );
  
  // Also remove any sticky associated with this todo
  let currentStickies = (roomSnap.exists() ? (roomSnap.data() as RoomData).stickies : []) || [];
  const linkedSticky = currentStickies.find(s => s.originId === todoId);
  if (linkedSticky) {
      currentStickies = currentStickies.filter(s => s.id !== linkedSticky.id);
      await updateDoc(roomRef, { todos: updatedTodos, stickies: currentStickies });
  } else {
      await updateDoc(roomRef, { todos: updatedTodos });
  }
};

export const deleteTodo = async (code: string, todo: TodoItem) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, { todos: arrayRemove(todo) });
};

// Toggle Pin Status (Enforce single pin rule)
// UPDATED: Now creates a Sticky on the home board when pinned
export const togglePinTodo = async (code: string, userId: string, todoId: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  
  const currentTodos = (roomSnap.data() as RoomData).todos || [];
  let currentStickies = (roomSnap.data() as RoomData).stickies || [];

  const target = currentTodos.find(t => t.id === todoId);
  if (!target) return;

  const wasPinned = !!target.isPinned;
  
  // 1. Update Todo State (One pin rule not strictly enforced on Todo Array logic anymore, but we enforce it on the Stickies array)
  // Actually, let's keep the UI state consistent.
  const updatedTodos = currentTodos.map(t => {
      if (t.id === todoId) return { ...t, isPinned: !wasPinned };
      if (!wasPinned && t.isPinned) return { ...t, isPinned: false }; // Unpin others if turning ON
      return t;
  });

  // 2. Manage Sticky
  if (!wasPinned) {
      // PINNING: Create a new Sticky
      // First, unpin ANY other sticky by this user (limit 1)
      currentStickies = currentStickies.map(s => 
        (s.userId === userId && s.isPinned) ? { ...s, isPinned: false } : s
      );

      const newSticky: Sticky = {
          id: getUUID(),
          userId,
          type: 'note',
          text: target.text,
          deadline: target.deadline, // Pass deadline!
          originId: target.id, // Link back
          isPinned: true,
          timestamp: Date.now(),
          rotation: 0
      };
      currentStickies.push(newSticky);

  } else {
      // UNPINNING: Remove the sticky associated with this todo
      currentStickies = currentStickies.filter(s => s.originId !== todoId);
  }

  await updateDoc(roomRef, { todos: updatedTodos, stickies: currentStickies });
};

// --- GOALS ---
export const addGoal = async (code: string, title: string, targetCount: number, reward: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const goal: Goal = {
    id: getUUID(),
    title,
    targetCount,
    currentCount: 0,
    reward,
    isCompleted: false,
    createdAt: Date.now()
  };
  await updateDoc(roomRef, { goals: arrayUnion(goal) });
};

export const incrementGoal = async (code: string, goalId: string, currentGoals: Goal[]) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const updatedGoals = currentGoals.map(g => {
    if (g.id === goalId && !g.isCompleted) {
      const newCount = g.currentCount + 1;
      return { 
        ...g, 
        currentCount: newCount,
        isCompleted: newCount >= g.targetCount
      };
    }
    return g;
  });
  await updateDoc(roomRef, { goals: updatedGoals });
};

export const deleteGoal = async (code: string, goal: Goal) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, { goals: arrayRemove(goal) });
};