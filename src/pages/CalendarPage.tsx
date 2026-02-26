import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitStore, formatDate } from '@/lib/habitStore';

const CalendarPage = () => {
  const { habits } = useHabitStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getCompletionForDay = (day: number) => {
    const date = formatDate(new Date(year, month, day));
    let completed = 0;
    let total = habits.length;
    habits.forEach((h) => {
      if (h.completions[date]) completed++;
    });
    if (total === 0) return 0;
    return completed / total;
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background px-5 pb-24 pt-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Calendar</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg bg-secondary p-2 text-secondary-foreground">
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-display font-semibold text-foreground">{monthName}</h2>
          <button onClick={nextMonth} className="rounded-lg bg-secondary p-2 text-secondary-foreground">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {days.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const completion = getCompletionForDay(day);
            const todayMark = isToday(day);
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.01 * day }}
                className={`relative flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  todayMark ? 'ring-2 ring-primary' : ''
                } ${
                  completion >= 1
                    ? 'gradient-primary text-primary-foreground'
                    : completion > 0
                    ? 'bg-primary/20 text-primary'
                    : 'text-foreground'
                }`}
              >
                {day}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded gradient-primary" /> All done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-primary/20" /> Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-secondary" /> None
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarPage;
