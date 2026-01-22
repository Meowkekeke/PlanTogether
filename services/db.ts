import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { RoomData, Mood, UserState, InteractionType, MoodEntry, Habit, TodoItem, Goal, HabitType, TodoType, Activity, ActivityNature, ActivityLog } from '../types';

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
    activities: [], // New tracker
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

export const logMood = async (code: string, userId: string, userName: string, mood: Mood, note: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const newEntry: MoodEntry = {
    id: getUUID(),
    userId,
    userName,
    mood,
    note: note || '', // Ensure no undefined
    timestamp: Date.now()
  };
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const data = roomSnap.data() as RoomData;
  const isHost = data.hostId === userId;
  const fieldPrefix = isHost ? 'hostState' : 'guestState';

  await updateDoc(roomRef, {
    logs: arrayUnion(newEntry),
    [`${fieldPrefix}.mood`]: mood,
    [`${fieldPrefix}.note`]: note || '',
    [`${fieldPrefix}.lastUpdated`]: Date.now()
  });
};

export const sendInteraction = async (code: string, userId: string, type: InteractionType) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, {
    lastInteraction: { type, senderId: userId, timestamp: Date.now() }
  });
};

// --- NEW TRACKER (ACTIVITIES) ---
export const addActivity = async (code: string, userId: string, title: string, nature: ActivityNature) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const activity: Activity = {
    id: getUUID(),
    ownerId: userId,
    title,
    nature,
    logs: [],
    createdAt: Date.now()
  };
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

// --- LEGACY HABITS (Optional support) ---
export const addHabit = async (code: string, title: string, type: HabitType) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const habit: Habit = {
    id: getUUID(),
    title,
    type,
    logs: [],
    createdAt: Date.now()
  };
  await updateDoc(roomRef, { habits: arrayUnion(habit) });
};

export const checkInHabit = async (code: string, habitId: string, userId: string, currentHabits: Habit[]) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const updatedHabits = currentHabits.map(h => {
    if (h.id === habitId) {
      return { 
        ...h, 
        logs: [...h.logs, { userId, timestamp: Date.now(), val: 1 }] 
      };
    }
    return h;
  });
  await updateDoc(roomRef, { habits: updatedHabits });
};

export const deleteHabit = async (code: string, habit: Habit) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, { habits: arrayRemove(habit) });
};

// --- LISTS ---
export const addTodo = async (code: string, text: string, type: TodoType, assignedTo?: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  const todo: TodoItem = {
    id: getUUID(),
    text,
    type,
    isCompleted: false,
    createdAt: Date.now()
  };

  if (assignedTo) {
    todo.assignedTo = assignedTo;
  }

  await updateDoc(roomRef, { todos: arrayUnion(todo) });
};

export const toggleTodo = async (code: string, todoId: string, currentTodos: TodoItem[]) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const updatedTodos = currentTodos.map(t => 
    t.id === todoId ? { ...t, isCompleted: !t.isCompleted } : t
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