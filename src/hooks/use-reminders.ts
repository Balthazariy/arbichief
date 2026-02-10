import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Reminder } from '@/lib/types';
import { toast } from 'sonner';

function getNextReminderDate(currentDate: string, recurrence: string): string {
  const date = new Date(currentDate);
  
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return currentDate;
  }
  
  return date.toISOString().split('T')[0];
}

function shouldTriggerReminder(reminder: Reminder, now: Date): boolean {
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  const currentDateTime = `${currentDate} ${currentTime}`;

  if (!reminder.isEnabled) {
    return false;
  }

  if (reminder.reminderDate > currentDate) {
    return false;
  }

  if (reminder.reminderDate === currentDate && reminder.reminderTime > currentTime) {
    return false;
  }

  if (reminder.recurrence === 'none') {
    return !reminder.notified && 
           reminder.reminderDate === currentDate && 
           reminder.reminderTime <= currentTime;
  }

  if (reminder.lastNotified) {
    const lastNotifiedDate = reminder.lastNotified.split(' ')[0];
    if (lastNotifiedDate === currentDate) {
      return false;
    }
  }

  const reminderDateTime = `${reminder.reminderDate} ${reminder.reminderTime}`;
  return reminderDateTime <= currentDateTime;
}

export function useReminders() {
  const [reminders, setReminders] = useKV<Reminder[]>('reminders', []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDateTime = `${currentDate} ${currentTime}`;

      setReminders((current) => {
        return (current || []).map((reminder) => {
          if (shouldTriggerReminder(reminder, now)) {
            toast.info(reminder.message, {
              duration: 10000,
            });

            if (reminder.recurrence === 'none') {
              return { ...reminder, notified: true, lastNotified: currentDateTime };
            } else {
              const nextDate = getNextReminderDate(reminder.reminderDate, reminder.recurrence);
              return {
                ...reminder,
                reminderDate: nextDate,
                lastNotified: currentDateTime,
              };
            }
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
