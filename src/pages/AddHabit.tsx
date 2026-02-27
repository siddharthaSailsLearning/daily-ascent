import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Music, Plus, Trash2 } from 'lucide-react';
import { useHabitStore } from '@/lib/habitStore';
import { scheduleHabitReminder } from '@/lib/notificationService';
import { pickAndSaveRingtone, loadSavedRingtones, deleteRingtone, CustomRingtone } from '@/lib/ringtoneService';
import { toast } from 'sonner';

const icons = ['🏋️', '📚', '🧘', '💧', '🏃', '🎨', '🎵', '💻', '🍎', '😴', '✍️', '🧹'];
const frequencies = ['daily', 'weekly', 'monthly'] as const;

const AddHabit = () => {
  const navigate = useNavigate();
  const { addHabit } = useHabitStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏋️');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reminderTime, setReminderTime] = useState('');
  const [selectedSound, setSelectedSound] = useState<string | undefined>(undefined);
  const [ringtones, setRingtones] = useState<CustomRingtone[]>(loadSavedRingtones);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  const handleAddRingtone = async () => {
    const ringtone = await pickAndSaveRingtone();
    if (ringtone) {
      setRingtones(loadSavedRingtones());
      setSelectedSound(ringtone.path);
      toast.success(`Added ringtone: ${ringtone.name}`);
    }
  };

  const handleDeleteRingtone = async (path: string) => {
    await deleteRingtone(path);
    setRingtones(loadSavedRingtones());
    if (selectedSound === path) setSelectedSound(undefined);
    toast.info('Ringtone removed');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const newHabit = addHabit({
      name: name.trim(),
      icon,
      color: 'primary',
      frequency,
      reminderTime: reminderTime || undefined,
      customSound: selectedSound,
    });

    // Schedule notification if reminder time is set
    if (reminderTime) {
      await scheduleHabitReminder(
        newHabit.id,
        newHabit.name,
        newHabit.icon,
        reminderTime,
        selectedSound
      );
      toast.success('Reminder alarm scheduled!', {
        description: `Daily at ${reminderTime}`,
      });
    }

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
        {/* Name */}
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

        {/* Icon */}
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

        {/* Frequency */}
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

        {/* Reminder Time */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Bell size={16} />
            Reminder Alarm (optional)
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {reminderTime && (
            <p className="mt-1.5 text-xs text-primary">
              ⏰ Will ring daily at {reminderTime}
            </p>
          )}
        </div>

        {/* Custom Ringtone */}
        {reminderTime && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Music size={16} />
              Alarm Sound
            </label>

            <button
              onClick={() => setShowSoundPicker(!showSoundPicker)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/50"
            >
              {selectedSound
                ? ringtones.find((r) => r.path === selectedSound)?.name || 'Custom sound'
                : 'Default sound'}
              <span className="float-right text-muted-foreground">▾</span>
            </button>

            {showSoundPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-xl border border-border bg-card p-3 space-y-2"
              >
                {/* Default option */}
                <button
                  onClick={() => { setSelectedSound(undefined); setShowSoundPicker(false); }}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                    !selectedSound ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  🔔 Default alarm sound
                </button>

                {/* Custom ringtones */}
                {ringtones.map((rt) => (
                  <div key={rt.path} className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedSound(rt.path); setShowSoundPicker(false); }}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                        selectedSound === rt.path
                          ? 'gradient-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      🎵 {rt.name}
                    </button>
                    <button
                      onClick={() => handleDeleteRingtone(rt.path)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Add new ringtone */}
                <button
                  onClick={handleAddRingtone}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus size={16} />
                  Upload from device
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Submit */}
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
