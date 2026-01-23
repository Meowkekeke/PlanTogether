
export enum Mood {
  // Positive (9)
  HAPPY = 'happy',
  EXCITED = 'excited',
  ROMANTIC = 'romantic',
  CHILL = 'chill',
  GRATEFUL = 'grateful',
  PROUD = 'proud',
  ENERGETIC = 'energetic',
  SILLY = 'silly',
  HOPEFUL = 'hopeful',
  
  // Neutral (9)
  HUNGRY = 'hungry',
  TIRED = 'tired',
  CONFUSED = 'confused',
  BORED = 'bored',
  BUSY = 'busy',
  CURIOUS = 'curious',
  MEH = 'meh',
  DISTRACTED = 'distracted',
  WAITING = 'waiting',

  // Negative (9)
  SAD = 'sad',
  ANGRY = 'angry',
  SICK = 'sick',
  STRESSED = 'stressed',
  ANXIOUS = 'anxious',
  LONELY = 'lonely',
  HURT = 'hurt',
  OVERWHELMED = 'overwhelmed',
  GRUMPY = 'grumpy'
}

export type InteractionType = 'water' | 'sun' | 'love' | 'poke';

export interface Interaction {
  type: InteractionType;
  senderId: string;
  timestamp: number;
}

export interface UserState {
  name: string;
  mood: Mood;
  note: string;
  lastUpdated: number; // Timestamp
}

export interface MoodEntry {
  id: string;
  userId: string;
  userName: string;
  mood: Mood;
  note: string;
  timestamp: number;
}

// --- Feature: Grocery List ---
export interface GroceryItem {
  id: string;
  text: string;
  isChecked: boolean;
  checkedAt?: number; // Timestamp when it was checked (for 12h removal logic)
}

// --- Feature 2: Tracker (Activities) ---
export type ActivityNature = 'ongoing' | 'session'; // "Something I keep doing" vs "Session"

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: number;
  // Optional Context
  durationMinutes?: number;
  quantity?: number; // pages, reps, etc.
  note?: string;
  isMilestone?: boolean; // Did this log complete a project? (e.g. Finished a book)
}

export interface Activity {
  id: string;
  ownerId: string; // Who created/owns this activity
  title: string;
  nature: ActivityNature;
  projectUnit?: string; // e.g. "Book", "Painting"
  icon?: string; // Optional emoji/icon
  logs: ActivityLog[];
  createdAt: number;
}

// Deprecated Habit types (keeping for type safety if needed during migration, or removal)
export type HabitType = 'simple' | 'outcome';
export interface HabitLog { userId: string; timestamp: number; val: number; }
export interface Habit { id: string; title: string; type: HabitType; logs: HabitLog[]; createdAt: number; }


// --- Feature 3: Together (List & Random) ---
export type TogetherCategory = 'list' | 'random';

export interface TodoItem {
  id: string;
  text: string;
  category: TogetherCategory;
  deadline?: number | null; // Timestamp for "List" items. Null means "No deadline".
  completedAt?: number; // If present, it's in the Folder
  createdAt: number;
  // Legacy fields (optional for migration safety)
  type?: string; 
  isCompleted?: boolean;
  // New: Pinned to Home
  isPinned?: boolean;
}

// --- Feature 4: Goals ---
export interface Goal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  reward: string;
  isCompleted: boolean;
  createdAt: number;
}

// --- NEW HOME: Sticky Notes ---
export type StickyType = 'mood' | 'note' | 'signal';

export enum Signal {
  SPACE = 'space', // "Need space"
  MISS_YOU = 'miss_you', // "Miss you"
  ATTENTION = 'attention', // "Look at me / Attention"
  LOVE = 'love', // "Sending love"
  COFFEE = 'coffee', // "Coffee/Break?"
  HOME = 'home' // "Coming home"
}

export interface Sticky {
  id: string;
  userId: string;
  type: StickyType;
  
  // Content varies by type
  mood?: Mood; 
  text?: string; // For Notes or Mood Caption
  signal?: Signal;

  timestamp: number;
  
  // Visuals (calculated on creation or client side)
  rotation: number; 

  // Pinned Logic
  isPinned?: boolean;
  deadline?: number | null; // If pinned from a Todo with a deadline
  originId?: string; // ID of the Todo this sticky came from (if any)
}

export interface RoomData {
  hostId: string;
  guestId?: string; 
  hostState: UserState;
  guestState: UserState;
  createdAt: number;
  lastInteraction?: Interaction;
  logs: MoodEntry[];
  
  // Collections
  stickies: Sticky[]; // The new Home Board
  groceries: GroceryItem[]; // Shared Grocery List
  activities: Activity[]; // The new tracker
  habits?: Habit[]; // Legacy, can remain empty
  todos: TodoItem[];
  goals: Goal[];
}

export type MoodCategory = 'positive' | 'neutral' | 'negative';

export const MOOD_CATEGORIES: Record<MoodCategory, { label: string, moods: Mood[], baseColor: string }> = {
  positive: { 
    label: 'Happy', 
    moods: [
        Mood.HAPPY, Mood.EXCITED, Mood.GRATEFUL, 
        Mood.ROMANTIC, Mood.CHILL, Mood.PROUD, 
        Mood.ENERGETIC, Mood.SILLY, Mood.HOPEFUL
    ],
    baseColor: 'bg-[#fef9c3]' // Yellow-100
  },
  neutral: { 
    label: 'Ok-ish', 
    moods: [
        Mood.HUNGRY, Mood.TIRED, Mood.CONFUSED, 
        Mood.BORED, Mood.BUSY, Mood.CURIOUS, 
        Mood.MEH, Mood.DISTRACTED, Mood.WAITING
    ],
    baseColor: 'bg-[#f3f4f6]' // Gray-100
  },
  negative: { 
    label: 'Not Good', 
    moods: [
        Mood.SAD, Mood.ANGRY, Mood.SICK, 
        Mood.STRESSED, Mood.ANXIOUS, Mood.LONELY, 
        Mood.HURT, Mood.OVERWHELMED, Mood.GRUMPY
    ],
    baseColor: 'bg-[#dbeafe]' // Blue-100
  }
};

export const MOOD_COLORS: Record<Mood, string> = {
  // Positive
  [Mood.HAPPY]: 'bg-yellow-200',
  [Mood.EXCITED]: 'bg-orange-200',
  [Mood.ROMANTIC]: 'bg-pink-200',
  [Mood.CHILL]: 'bg-purple-200',
  [Mood.GRATEFUL]: 'bg-teal-200',
  [Mood.PROUD]: 'bg-amber-200',
  [Mood.ENERGETIC]: 'bg-yellow-300',
  [Mood.SILLY]: 'bg-fuchsia-200',
  [Mood.HOPEFUL]: 'bg-sky-200',
  
  // Neutral
  [Mood.HUNGRY]: 'bg-lime-200',
  [Mood.TIRED]: 'bg-slate-200',
  [Mood.CONFUSED]: 'bg-orange-100',
  [Mood.BORED]: 'bg-gray-200',
  [Mood.BUSY]: 'bg-blue-100',
  [Mood.CURIOUS]: 'bg-emerald-100',
  [Mood.MEH]: 'bg-stone-200',
  [Mood.DISTRACTED]: 'bg-violet-100',
  [Mood.WAITING]: 'bg-zinc-200',

  // Negative
  [Mood.SAD]: 'bg-blue-200',
  [Mood.ANGRY]: 'bg-red-200',
  [Mood.SICK]: 'bg-emerald-100',
  [Mood.STRESSED]: 'bg-rose-200',
  [Mood.ANXIOUS]: 'bg-indigo-200',
  [Mood.LONELY]: 'bg-gray-300',
  [Mood.HURT]: 'bg-red-100',
  [Mood.OVERWHELMED]: 'bg-slate-300',
  [Mood.GRUMPY]: 'bg-blue-300',
};
