import { motion } from 'framer-motion';
import { Check, Pencil } from 'lucide-react';
import { Habit } from '@/lib/habitStore';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onEdit?: () => void;
}

const HabitCard = ({ habit, completed, streak, onToggle, onEdit }: HabitCardProps) => {
  return (
    <motion.div
      className={`glass-card flex w-full items-center gap-4 p-4 transition-all duration-300 ${
        completed ? 'glow-primary border-primary/30' : ''
      }`}
    >
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        animate={completed ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
          completed ? 'gradient-primary' : 'bg-secondary'
        }`}
      >
        {completed ? <Check size={20} className="text-primary-foreground" /> : habit.icon}
      </motion.button>
      <button onClick={onToggle} className="flex-1 min-w-0 text-left">
        <p
          className={`font-display font-semibold truncate ${
            completed ? 'text-primary' : 'text-foreground'
          }`}
        >
          {habit.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
      </button>
      {streak > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1">
          <span className="text-xs">🔥</span>
          <span className="text-xs font-semibold text-accent">{streak}</span>
        </div>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={16} />
        </button>
      )}
    </motion.div>
  );
};

export default HabitCard;
