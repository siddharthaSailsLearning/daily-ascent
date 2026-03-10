import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore, getToday } from '@/lib/habitStore';
import { useAuthStore } from '@/lib/authStore';
import HabitCard from '@/components/HabitCard';
import EditHabitDialog from '@/components/EditHabitDialog';
import CircularProgress from '@/components/CircularProgress';
import { Flame, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scheduleHabitReminder, cancelHabitReminder } from '@/lib/notificationService';
import { toast } from 'sonner';
import { Habit } from '@/lib/habitStore';

const Dashboard = () => {
  const { habits, toggleCompletion, updateHabit, removeHabit, getCompletionsForDate, getStreak } = useHabitStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const today = getToday();

  const todayData = useMemo(() => getCompletionsForDate(today), [habits, today]);
  const completedCount = useMemo(() => todayData.filter((d) => d.completed).length, [todayData]);
  const totalCount = todayData.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const bestStreak = useMemo(() => Math.max(...habits.map((h) => getStreak(h.id)), 0), [habits]);

  const dayName = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), []);
  const dateStr = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), []);

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const handleToggle = useCallback((habitId: string) => {
    toggleCompletion(habitId, today);
  }, [today, toggleCompletion]);

  const handleUpdateHabit = useCallback(async (updates: Partial<Omit<Habit, 'id' | 'createdAt' | 'completions'>>) => {
    if (!editingHabit) return;
    updateHabit(editingHabit.id, updates);

    await cancelHabitReminder(editingHabit.id);
    if (updates.reminderTime) {
      await scheduleHabitReminder(
        editingHabit.id,
        updates.name || editingHabit.name,
        updates.icon || editingHabit.icon,
        updates.reminderTime,
        updates.customSound
      );
      toast.success('Reminder updated!');
    }
  }, [editingHabit, updateHabit]);

  const handleDeleteHabit = useCallback(async () => {
    if (!editingHabit) return;
    await cancelHabitReminder(editingHabit.id);
    removeHabit(editingHabit.id);
    toast.info('Habit deleted');
    setEditingHabit(null);
  }, [editingHabit, removeHabit]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-background px-5 pb-24 pt-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{dayName}</p>
          <h1 className="font-display text-3xl font-bold text-foreground">{dateStr}</h1>
          {user && <p className="text-xs text-muted-foreground mt-1">Hi, {user.name} 👋</p>}
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      <div className="glass-card glow-primary mb-8 flex items-center gap-6 p-6">
        <CircularProgress value={percentage} size={100} strokeWidth={7} label={`${percentage}%`} sublabel="done" />
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-foreground">Today's Progress</h2>
          <p className="text-sm text-muted-foreground">{completedCount} of {totalCount} habits completed</p>
          {bestStreak > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Flame size={16} className="text-accent" />
              <span className="text-sm font-medium text-accent">{bestStreak} day streak</span>
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Your Habits</h2>

      <div className="space-y-3">
        {todayData.map(({ habit, completed }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            completed={completed}
            streak={getStreak(habit.id)}
            onToggle={() => handleToggle(habit.id)}
            onEdit={() => setEditingHabit(habit)}
          />
        ))}
      </div>

      {habits.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-5xl mb-4">✨</p>
          <p className="font-display text-lg font-semibold text-foreground">No habits yet</p>
          <p className="text-sm text-muted-foreground">Tap the + button to add your first habit</p>
        </div>
      )}

      {editingHabit && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(open) => { if (!open) setEditingHabit(null); }}
          onSave={handleUpdateHabit}
          onDelete={handleDeleteHabit}
        />
      )}
    </div>
  );
};

export default Dashboard;
