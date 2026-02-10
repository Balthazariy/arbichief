import { useState } from 'react';
import { Bell, Plus, Trash, CalendarBlank, Clock } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Tournament, Reminder } from '@/lib/types';
import { generateId } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReminderManagerProps {
  tournament: Tournament;
}

export default function ReminderManager({ tournament }: ReminderManagerProps) {
  const [reminders, setReminders] = useKV<Reminder[]>('reminders', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    reminderDate: tournament.startDate,
    reminderTime: '09:00',
    message: `Нагадування: турнір "${tournament.name}" розпочинається сьогодні!`,
  });

  const tournamentReminders = (reminders || []).filter(
    (r) => r.tournamentId === tournament.id
  );

  const resetForm = () => {
    setFormData({
      reminderDate: tournament.startDate,
      reminderTime: '09:00',
      message: `Нагадування: турнір "${tournament.name}" розпочинається сьогодні!`,
    });
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

    const newReminder: Reminder = {
      id: generateId(),
      tournamentId: tournament.id,
      reminderDate: formData.reminderDate,
      reminderTime: formData.reminderTime,
      message: formData.message,
      isEnabled: true,
      notified: false,
    };

    setReminders((current) => [...(current || []), newReminder]);
    toast.success('Нагадування створено');
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} weight="bold" className="mr-2" />
                Додати нагадування
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Нове нагадування</DialogTitle>
                <DialogDescription>
                  Створіть нагадування про турнір
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
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarBlank size={14} />
                      {formatDate(reminder.reminderDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {reminder.reminderTime}
                    </div>
                    {reminder.notified && (
                      <Badge variant="secondary" className="text-xs">
                        Відправлено
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
