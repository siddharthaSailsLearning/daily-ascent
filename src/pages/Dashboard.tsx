import { motion } from 'framer-motion';
import { useHabitStore, getToday } from '@/lib/habitStore';
import HabitCard from '@/components/HabitCard';
import CircularProgress from '@/components/CircularProgress';
import { Flame } from 'lucide-react';

const Dashboard = () => {
  const { habits, toggleCompletion, getCompletionsForDate, getStreak } = useHabitStore();
  const today = getToday();
  const todayData = getCompletionsForDate(today);
  const completedCount = todayData.filter((d) => d.completed).length;
  const totalCount = todayData.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const bestStreak = Math.max(...habits.map((h) => getStreak(h.id)), 0);

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background px-5 pb-24 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm text-muted-foreground">{dayName}</p>
        <h1 className="font-display text-3xl font-bold text-foreground">{dateStr}</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card glow-primary mb-8 flex items-center gap-6 p-6"
      >
        <CircularProgress
          value={percentage}
          size={100}
          strokeWidth={7}
          label={`${percentage}%`}
          sublabel="done"
        />
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-foreground">Today's Progress</h2>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} habits completed
          </p>
          {bestStreak > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Flame size={16} className="text-accent" />
              <span className="text-sm font-medium text-accent">
                {bestStreak} day streak
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Your Habits</h2>

      <div className="space-y-3">
        {todayData.map(({ habit, completed }, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <HabitCard
              habit={habit}
              completed={completed}
              streak={getStreak(habit.id)}
              onToggle={() => toggleCompletion(habit.id, today)}
            />
          </motion.div>
        ))}
      </div>

      {habits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-5xl mb-4">✨</p>
          <p className="font-display text-lg font-semibold text-foreground">No habits yet</p>
          <p className="text-sm text-muted-foreground">Tap the + button to add your first habit</p>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
