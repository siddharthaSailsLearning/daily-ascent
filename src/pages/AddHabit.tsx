import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useHabitStore } from '@/lib/habitStore';

const icons = ['🏋️', '📚', '🧘', '💧', '🏃', '🎨', '🎵', '💻', '🍎', '😴', '✍️', '🧹'];
const frequencies = ['daily', 'weekly', 'monthly'] as const;

const AddHabit = () => {
  const navigate = useNavigate();
  const { addHabit } = useHabitStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏋️');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reminderTime, setReminderTime] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), icon, color: 'primary', frequency, reminderTime: reminderTime || undefined });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background px-5 pb-24 pt-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">New Habit</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Exercise"
            maxLength={50}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">Icon</label>
          <div className="flex flex-wrap gap-2">
            {icons.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-all ${
                  icon === ic ? 'gradient-primary scale-110 glow-primary' : 'bg-secondary'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">Frequency</label>
          <div className="flex gap-2">
            {frequencies.map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium capitalize transition-all ${
                  frequency === f
                    ? 'gradient-primary text-primary-foreground glow-primary'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">Reminder (optional)</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full rounded-xl gradient-primary py-4 font-display font-semibold text-primary-foreground transition-opacity disabled:opacity-40 glow-primary"
        >
          Create Habit
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AddHabit;
