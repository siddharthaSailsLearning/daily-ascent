import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Habit } from '@/lib/habitStore';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
}

const HabitCard = ({ habit, completed, streak, onToggle }: HabitCardProps) => {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className={`glass-card flex w-full items-center gap-4 p-4 text-left transition-all duration-300 ${
        completed ? 'glow-primary border-primary/30' : ''
      }`}
    >
      <motion.div
        animate={completed ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
          completed
            ? 'gradient-primary'
            : 'bg-secondary'
        }`}
      >
        {completed ? <Check size={20} className="text-primary-foreground" /> : habit.icon}
      </motion.div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-display font-semibold truncate ${
            completed ? 'text-primary' : 'text-foreground'
          }`}
        >
          {habit.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1">
          <span className="text-xs">🔥</span>
          <span className="text-xs font-semibold text-accent">{streak}</span>
        </div>
      )}
    </motion.button>
  );
};

export default HabitCard;
