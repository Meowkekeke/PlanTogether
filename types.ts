export enum Mood {
  // Positive
  HAPPY = 'happy',
  EXCITED = 'excited',
  ROMANTIC = 'romantic',
  CHILL = 'chill',
  GRATEFUL = 'grateful',
  
  // Neutral/Body
  HUNGRY = 'hungry',
  TIRED = 'tired',
  CONFUSED = 'confused',

  // Negative
  SAD = 'sad',
  ANGRY = 'angry',
  SICK = 'sick',
  STRESSED = 'stressed'
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


// --- Feature 3: List ---
export type TodoType = 'me' | 'you' | 'we';
export interface TodoItem {
  id: string;
  text: string;
  type: TodoType;
  assignedTo?: string; // userId for 'me'/'you' logic
  isCompleted: boolean;
  createdAt: number;
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

export interface RoomData {
  hostId: string;
  guestId?: string; 
  hostState: UserState;
  guestState: UserState;
  createdAt: number;
  lastInteraction?: Interaction;
  logs: MoodEntry[];
  
  // Collections
  activities: Activity[]; // The new tracker
  habits?: Habit[]; // Legacy, can remain empty
  todos: TodoItem[];
  goals: Goal[];
}

export type MoodCategory = 'positive' | 'neutral' | 'negative';

export const MOOD_CATEGORIES: Record<MoodCategory, { label: string, emoji: string, moods: Mood[], baseColor: string }> = {
  positive: { 
    label: 'Happy', 
    emoji: '😊',
    moods: [Mood.HAPPY, Mood.EXCITED, Mood.ROMANTIC, Mood.CHILL, Mood.GRATEFUL],
    baseColor: 'bg-[#fef9c3]' // Yellow-100
  },
  neutral: { 
    label: 'Ok-ish', 
    emoji: '😐',
    moods: [Mood.HUNGRY, Mood.TIRED, Mood.CONFUSED],
    baseColor: 'bg-[#f3f4f6]' // Gray-100
  },
  negative: { 
    label: 'Not Good', 
    emoji: '😫',
    moods: [Mood.SAD, Mood.ANGRY, Mood.SICK, Mood.STRESSED],
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
  
  // Neutral
  [Mood.HUNGRY]: 'bg-lime-200',
  [Mood.TIRED]: 'bg-slate-200',
  [Mood.CONFUSED]: 'bg-amber-100', // Beige

  // Negative
  [Mood.SAD]: 'bg-blue-200',
  [Mood.ANGRY]: 'bg-red-200',
  [Mood.SICK]: 'bg-emerald-100', // Sickly green
  [Mood.STRESSED]: 'bg-rose-200',
};