import { useState } from 'react';
import { Bell, Plus, Trash, CalendarBlank, Clock, PencilSimple, Repeat } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Tournament, Reminder, RecurrenceType } from '@/lib/types';
import { generateId } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReminderManagerProps {
  tournament: Tournament;
}

export default function ReminderManager({ tournament }: ReminderManagerProps) {
  const [reminders, setReminders] = useKV<Reminder[]>('reminders', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    reminderDate: tournament.startDate,
    reminderTime: '09:00',
    message: `Нагадування: турнір "${tournament.name}" розпочинається сьогодні!`,
    recurrence: 'none' as RecurrenceType,
  });

  const tournamentReminders = (reminders || []).filter(
    (r) => r.tournamentId === tournament.id
  );

  const resetForm = () => {
    setFormData({
      reminderDate: tournament.startDate,
      reminderTime: '09:00',
      message: `Нагадування: турнір "${tournament.name}" розпочинається сьогодні!`,
      recurrence: 'none',
    });
    setEditingReminder(null);
  };

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      reminderDate: reminder.reminderDate,
      reminderTime: reminder.reminderTime,
      message: reminder.message,
      recurrence: reminder.recurrence,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.message.trim()) {
      toast.error('Введіть повідомлення');
      return;
    }

    if (!formData.reminderDate || !formData.reminderTime) {
      toast.error('Виберіть дату та час нагадування');
      return;
    }

    if (editingReminder) {
      setReminders((current) =>
        (current || []).map((r) =>
          r.id === editingReminder.id
            ? {
                ...r,
                reminderDate: formData.reminderDate,
                reminderTime: formData.reminderTime,
                message: formData.message,
                recurrence: formData.recurrence,
                notified: false,
                lastNotified: undefined,
              }
            : r
        )
      );
      toast.success('Нагадування оновлено');
    } else {
      const newReminder: Reminder = {
        id: generateId(),
        tournamentId: tournament.id,
        reminderDate: formData.reminderDate,
        reminderTime: formData.reminderTime,
        message: formData.message,
        recurrence: formData.recurrence,
        isEnabled: true,
        notified: false,
      };

      setReminders((current) => [...(current || []), newReminder]);
      toast.success('Нагадування створено');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleToggle = (reminderId: string) => {
    setReminders((current) =>
      (current || []).map((r) =>
        r.id === reminderId ? { ...r, isEnabled: !r.isEnabled } : r
      )
    );
  };

  const handleDelete = (reminderId: string) => {
    setReminders((current) => (current || []).filter((r) => r.id !== reminderId));
    toast.success('Нагадування видалено');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRecurrenceLabel = (recurrence: RecurrenceType) => {
    switch (recurrence) {
      case 'daily':
        return 'Щодня';
      case 'weekly':
        return 'Щотижня';
      case 'monthly':
        return 'Щомісяця';
      case 'none':
      default:
        return 'Одноразово';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={24} weight="bold" className="text-primary" />
            <div>
              <CardTitle>Нагадування</CardTitle>
              <CardDescription>
                Керуйте нагадуваннями про турнір
              </CardDescription>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} weight="bold" className="mr-2" />
                Додати нагадування
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingReminder ? 'Редагувати нагадування' : 'Нове нагадування'}
                </DialogTitle>
                <DialogDescription>
                  {editingReminder
                    ? 'Змініть деталі нагадування про турнір'
                    : 'Створіть нагадування про турнір'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderDate">Дата нагадування</Label>
                  <div className="relative">
                    <CalendarBlank
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="reminderDate"
                      type="date"
                      value={formData.reminderDate}
                      onChange={(e) =>
                        setFormData({ ...formData, reminderDate: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Час нагадування</Label>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="reminderTime"
                      type="time"
                      value={formData.reminderTime}
                      onChange={(e) =>
                        setFormData({ ...formData, reminderTime: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence">Повторення</Label>
                  <div className="relative">
                    <Repeat
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                    />
                    <Select
                      value={formData.recurrence}
                      onValueChange={(value: RecurrenceType) =>
                        setFormData({ ...formData, recurrence: value })
                      }
                    >
                      <SelectTrigger id="recurrence" className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Одноразово</SelectItem>
                        <SelectItem value="daily">Щодня</SelectItem>
                        <SelectItem value="weekly">Щотижня</SelectItem>
                        <SelectItem value="monthly">Щомісяця</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.recurrence !== 'none' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Нагадування буде повторюватись автоматично після кожного спрацювання
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Повідомлення</Label>
                  <Input
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Текст нагадування"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    Зберегти
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Скасувати
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {tournamentReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell size={48} className="mx-auto mb-4 opacity-30" />
            <p>Немає нагадувань для цього турніру</p>
            <p className="text-sm mt-1">Створіть нагадування, щоб не забути про важливі події</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournamentReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                  reminder.isEnabled
                    ? 'bg-card border-border'
                    : 'bg-muted/30 border-border/50'
                )}
              >
                <div className="flex-1 space-y-1">
                  <p
                    className={cn(
                      'font-medium',
                      !reminder.isEnabled && 'text-muted-foreground'
                    )}
                  >
                    {reminder.message}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <CalendarBlank size={14} />
                      {formatDate(reminder.reminderDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {reminder.reminderTime}
                    </div>
                    {reminder.recurrence !== 'none' && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Repeat size={12} />
                        {getRecurrenceLabel(reminder.recurrence)}
                      </Badge>
                    )}
                    {reminder.notified && reminder.recurrence === 'none' && (
                      <Badge variant="secondary" className="text-xs">
                        Відправлено
                      </Badge>
                    )}
                    {reminder.lastNotified && reminder.recurrence !== 'none' && (
                      <Badge variant="secondary" className="text-xs">
                        Останнє: {new Date(reminder.lastNotified).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(reminder)}
                    className="text-primary hover:text-primary"
                    disabled={reminder.notified && reminder.recurrence === 'none'}
                  >
                    <PencilSimple size={18} />
                  </Button>
                  <Switch
                    checked={reminder.isEnabled}
                    onCheckedChange={() => handleToggle(reminder.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reminder.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
