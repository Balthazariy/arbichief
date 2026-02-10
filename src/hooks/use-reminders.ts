import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Reminder } from '@/lib/types';
import { toast } from 'sonner';

export function useReminders() {
  const [reminders, setReminders] = useKV<Reminder[]>('reminders', []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      setReminders((current) => {
        return (current || []).map((reminder) => {
          if (
            reminder.isEnabled &&
            !reminder.notified &&
            reminder.reminderDate === currentDate &&
            reminder.reminderTime <= currentTime
          ) {
            toast.info(reminder.message, {
              duration: 10000,
            });

            return { ...reminder, notified: true };
          }
          return reminder;
        });
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [setReminders]);

  return { reminders, setReminders };
}
