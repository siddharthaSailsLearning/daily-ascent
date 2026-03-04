import { create } from 'zustand';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays?: number[];
  reminderTime?: string;
  customSound?: string;
  createdAt: string;
  completions: Record<string, boolean>;
}

interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => Habit;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt' | 'completions'>>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (id: string, date: string) => void;
  getCompletionsForDate: (date: string) => { habit: Habit; completed: boolean }[];
  getStreak: (id: string) => number;
  getCompletionRate: (id: string, days: number) => number;
}

const loadHabits = (): Habit[] => {
  try {
    const data = localStorage.getItem('habits');
    return data ? JSON.parse(data) : getDefaultHabits();
  } catch {
    return getDefaultHabits();
  }
};

const getDefaultHabits = (): Habit[] => [
  {
    id: '1',
    name: 'Morning Exercise',
    icon: '🏋️',
    color: 'primary',
    frequency: 'daily',
    reminderTime: '07:00',
    createdAt: '2025-01-01',
    completions: {},
  },
  {
    id: '2',
    name: 'Read 30 min',
    icon: '📚',
    color: 'accent',
    frequency: 'daily',
    reminderTime: '21:00',
    createdAt: '2025-01-01',
    completions: {},
  },
  {
    id: '3',
    name: 'Meditate',
    icon: '🧘',
    color: 'chart-3',
    frequency: 'daily',
    reminderTime: '06:30',
    createdAt: '2025-01-01',
    completions: {},
  },
  {
    id: '4',
    name: 'Drink Water',
    icon: '💧',
    color: 'chart-4',
    frequency: 'daily',
    createdAt: '2025-01-01',
    completions: {},
  },
];

const saveHabits = (habits: Habit[]) => {
  localStorage.setItem('habits', JSON.stringify(habits));
};

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: loadHabits(),

  addHabit: (habit) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      completions: {},
    };
    set((state) => {
      const habits = [...state.habits, newHabit];
      saveHabits(habits);
      return { habits };
    });
    return newHabit;
  },

  updateHabit: (id, updates) => {
    set((state) => {
      const habits = state.habits.map((h) => {
        if (h.id !== id) return h;
        return { ...h, ...updates };
      });
      saveHabits(habits);
      return { habits };
    });
  },

  removeHabit: (id) => {
    set((state) => {
      const habits = state.habits.filter((h) => h.id !== id);
      saveHabits(habits);
      return { habits };
    });
  },

  toggleCompletion: (id, date) => {
    set((state) => {
      const habits = state.habits.map((h) => {
        if (h.id !== id) return h;
        const completions = { ...h.completions };
        completions[date] = !completions[date];
        return { ...h, completions };
      });
      saveHabits(habits);
      return { habits };
    });
  },

  getCompletionsForDate: (date) => {
    return get().habits.map((habit) => ({
      habit,
      completed: !!habit.completions[date],
    }));
  },

  getStreak: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (habit.completions[key]) streak++;
      else break;
    }
    return streak;
  },

  getCompletionRate: (id, days) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return 0;
    let completed = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (habit.completions[key]) completed++;
    }
    return Math.round((completed / days) * 100);
  },
}));

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];
export const getToday = (): string => formatDate(new Date());
