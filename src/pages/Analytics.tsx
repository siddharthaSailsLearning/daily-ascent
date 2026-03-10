import { useState, useMemo } from 'react';
import { useHabitStore } from '@/lib/habitStore';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CircularProgress from '@/components/CircularProgress';
import { Filter } from 'lucide-react';

const CHART_COLORS = [
  'hsl(160, 84%, 44%)',
  'hsl(38, 92%, 55%)',
  'hsl(200, 80%, 55%)',
  'hsl(280, 70%, 55%)',
  'hsl(340, 75%, 55%)',
];

const Analytics = () => {
  const { habits, getCompletionRate, getStreak } = useHabitStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(habits.map((h) => h.id)));

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(habits.map((h) => h.id)));
  const filtered = useMemo(() => habits.filter((h) => selectedIds.has(h.id)), [habits, selectedIds]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    return days.map((label, i) => {
      const offset = ((i + 1) % 7) - dayOfWeek;
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      const dateKey = d.toISOString().split('T')[0];
      const completed = filtered.filter((h) => h.completions[dateKey]).length;
      return { name: label, completed, total: filtered.length };
    });
  }, [filtered]);

  const pieData = useMemo(
    () => filtered.map((h) => ({ name: h.name, value: getCompletionRate(h.id, 30) })),
    [filtered, habits]
  );

  const overallRate = useMemo(
    () => filtered.length > 0
      ? Math.round(filtered.reduce((acc, h) => acc + getCompletionRate(h.id, 7), 0) / filtered.length)
      : 0,
    [filtered, habits]
  );

  return (
    <div className="min-h-screen bg-background px-5 pb-24 pt-12">
      <div>
        <h1 className="mb-4 font-display text-3xl font-bold text-foreground">Analytics</h1>
      </div>

      {/* Filter chips */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Filter habits</span>
          {selectedIds.size < habits.length && (
            <button onClick={selectAll} className="ml-auto text-xs text-primary hover:underline">Select all</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {habits.map((h) => {
            const active = selectedIds.has(h.id);
            return (
              <button
                key={h.id}
                onClick={() => toggleSelection(h.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'gradient-primary text-primary-foreground glow-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <span>{h.icon}</span>
                <span className="truncate max-w-[80px]">{h.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card mb-6 flex flex-col items-center p-6">
        <CircularProgress value={overallRate} size={140} strokeWidth={10} label={`${overallRate}%`} sublabel="weekly avg" />
        <h2 className="mt-4 font-display font-semibold text-foreground">Overall Completion</h2>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {habits.length} habits · Last 7 days
        </p>
      </div>

      <div className="glass-card mb-6 p-5">
        <h3 className="mb-4 font-display font-semibold text-foreground">This Week</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 12 }} />
            <YAxis hide />
            <Bar dataKey="completed" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 44%)" />
                <stop offset="100%" stopColor="hsl(200, 80%, 55%)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card mb-6 p-5">
        <h3 className="mb-4 font-display font-semibold text-foreground">30-Day Breakdown</h3>
        {filtered.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pieData} innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {filtered.map((h, i) => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="flex-1 truncate text-sm text-foreground">{h.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">{getCompletionRate(h.id, 30)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No data yet</p>
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 font-display font-semibold text-foreground">Streaks</h3>
        <div className="space-y-3">
          {filtered.map((h) => {
            const streak = getStreak(h.id);
            return (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-xl">{h.icon}</span>
                <span className="flex-1 truncate text-sm font-medium text-foreground">{h.name}</span>
                <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1">
                  <span className="text-xs">🔥</span>
                  <span className="text-xs font-semibold text-accent">{streak}</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Select habits to see streaks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
