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

// --- NEW HOME: STICKIES ---
export const addSticky = async (code: string, userId: string, type: StickyType, content: { mood?: Mood, text?: string, signal?: Signal }) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;

  const data = roomSnap.data() as RoomData;
  let currentStickies = data.stickies || [];
  const now = Date.now();

  // 1. Cleanup Expired (Older than 24h)
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  currentStickies = currentStickies.filter(s => s.timestamp > oneDayAgo);

  // 2. Logic based on type
  if (type === 'mood') {
    // Replace user's existing mood sticky
    currentStickies = currentStickies.filter(s => !(s.userId === userId && s.type === 'mood'));
  } else if (type === 'note') {
    // Keep max 2 notes per user. If adding a 3rd, remove oldest.
    const myNotes = currentStickies.filter(s => s.userId === userId && s.type === 'note').sort((a, b) => a.timestamp - b.timestamp);
    if (myNotes.length >= 2) {
      const idToRemove = myNotes[0].id; // Oldest
      currentStickies = currentStickies.filter(s => s.id !== idToRemove);
    }
  } else if (type === 'signal') {
    // One active signal per TYPE per person
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
    rotation: Math.floor(Math.random() * 10) - 5, // -5 to +5 degrees
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
  const updatedTodos = currentTodos.map(t => 
    t.id === todoId ? { ...t, completedAt: Date.now() } : t
  );
  await updateDoc(roomRef, { todos: updatedTodos });
};

export const deleteTodo = async (code: string, todo: TodoItem) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, { todos: arrayRemove(todo) });
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