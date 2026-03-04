import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Music, Plus, Trash2 } from 'lucide-react';
import { Habit } from '@/lib/habitStore';
import { pickAndSaveRingtone, loadSavedRingtones, deleteRingtone, CustomRingtone } from '@/lib/ringtoneService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const icons = ['🏋️', '📚', '🧘', '💧', '🏃', '🎨', '🎵', '💻', '🍎', '😴', '✍️', '🧹'];
const frequencies = ['daily', 'weekly', 'monthly'] as const;

interface EditHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Omit<Habit, 'id' | 'createdAt' | 'completions'>>) => void;
  onDelete: () => void;
}

const EditHabitDialog = ({ habit, open, onOpenChange, onSave, onDelete }: EditHabitDialogProps) => {
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);
  const [frequency, setFrequency] = useState(habit.frequency);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime || '');
  const [selectedSound, setSelectedSound] = useState<string | undefined>(habit.customSound);
  const [ringtones, setRingtones] = useState<CustomRingtone[]>(loadSavedRingtones);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon,
      frequency,
      reminderTime: reminderTime || undefined,
      customSound: selectedSound,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Edit Habit</DialogTitle>
          <DialogDescription className="text-muted-foreground">Modify your habit details</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
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
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Frequency</label>
            <div className="flex gap-2">
              {frequencies.map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium capitalize transition-all ${
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

          {/* Reminder */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bell size={14} /> Reminder
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Sound */}
          {reminderTime && (
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Music size={14} /> Alarm Sound
              </label>
              <button
                onClick={() => setShowSoundPicker(!showSoundPicker)}
                className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-left text-sm text-foreground"
              >
                {selectedSound ? ringtones.find((r) => r.path === selectedSound)?.name || 'Custom' : 'Default'}
                <span className="float-right text-muted-foreground">▾</span>
              </button>
              {showSoundPicker && (
                <div className="mt-2 rounded-xl border border-border bg-secondary p-2 space-y-1.5">
                  <button
                    onClick={() => { setSelectedSound(undefined); setShowSoundPicker(false); }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${!selectedSound ? 'gradient-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    🔔 Default
                  </button>
                  {ringtones.map((rt) => (
                    <div key={rt.path} className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelectedSound(rt.path); setShowSoundPicker(false); }}
                        className={`flex-1 rounded-lg px-3 py-2 text-left text-sm ${selectedSound === rt.path ? 'gradient-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        🎵 {rt.name}
                      </button>
                      <button onClick={() => handleDeleteRingtone(rt.path)} className="p-1.5 text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddRingtone}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Plus size={14} /> Upload
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 rounded-xl gradient-primary py-3 font-display font-semibold text-primary-foreground disabled:opacity-40 glow-primary"
            >
              Save Changes
            </motion.button>
          </div>

          {/* Delete */}
          <div className="border-t border-border pt-4">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                <Trash2 size={16} /> Delete Habit
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-sm text-destructive">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-xl bg-secondary py-2.5 text-sm text-secondary-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDelete(); onOpenChange(false); }}
                    className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-medium text-destructive-foreground"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditHabitDialog;
