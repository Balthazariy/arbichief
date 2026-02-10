import { useState, useMemo } from 'react';
import { CalendarBlank, CaretLeft, CaretRight, Clock, Bell, Trophy, Repeat } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Reminder, Tournament } from '@/lib/types';
import { useDatabase } from '@/hooks/use-database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  reminders: (Reminder & { tournament?: Tournament })[];
}

export default function CalendarView() {
  const [reminders] = useKV<Reminder[]>('reminders', []);
  const { data: tournaments } = useDatabase<Tournament>('tournaments');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  const getCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const days: CalendarDay[] = [];
    
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        reminders: [],
      });
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        reminders: [],
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        reminders: [],
      });
    }
    
    days.forEach((day) => {
      const dateString = day.date.toISOString().split('T')[0];
      const dayReminders = (reminders || []).filter(
        (r) => r.reminderDate === dateString && r.isEnabled
      );
      
      day.reminders = dayReminders.map((reminder) => ({
        ...reminder,
        tournament: tournaments.find((t) => t.id === reminder.tournamentId),
      }));
    });
    
    return days;
  }, [currentDate, reminders, tournaments]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.reminders.length > 0) {
      setSelectedDay(day);
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getRecurrenceLabel = (recurrence: string) => {
    switch (recurrence) {
      case 'daily':
        return 'Щодня';
      case 'weekly':
        return 'Щотижня';
      case 'monthly':
        return 'Щомісяця';
      default:
        return '';
    }
  };

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (reminders || [])
      .filter((r) => {
        const reminderDate = new Date(r.reminderDate);
        reminderDate.setHours(0, 0, 0, 0);
        return r.isEnabled && reminderDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.reminderDate}T${a.reminderTime}`);
        const dateB = new Date(`${b.reminderDate}T${b.reminderTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5)
      .map((reminder) => ({
        ...reminder,
        tournament: tournaments.find((t) => t.id === reminder.tournamentId),
      }));
  }, [reminders, tournaments]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CalendarBlank size={32} weight="bold" className="text-primary" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Календар нагадувань</h2>
            <p className="text-muted-foreground">
              Перегляд усіх нагадувань про турніри та змагання
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Сьогодні
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                >
                  <CaretLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                >
                  <CaretRight size={18} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
              
              {getCalendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!day.isCurrentMonth}
                  className={cn(
                    'aspect-square p-2 rounded-lg text-sm font-medium transition-all relative',
                    'hover:bg-muted disabled:opacity-30 disabled:cursor-default',
                    day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                    day.isToday && 'bg-primary/10 ring-2 ring-primary ring-inset',
                    day.reminders.length > 0 && day.isCurrentMonth && 'cursor-pointer',
                    selectedDay?.date.getTime() === day.date.getTime() && 'bg-accent'
                  )}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span>{day.date.getDate()}</span>
                    {day.reminders.length > 0 && day.isCurrentMonth && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {day.reminders.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-accent"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedDay && selectedDay.reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDay.date.toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </CardTitle>
                <CardDescription>
                  {selectedDay.reminders.length} {selectedDay.reminders.length === 1 ? 'нагадування' : 'нагадувань'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedDay.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-3 rounded-lg border bg-card space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <Bell size={16} className="text-accent mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {reminder.message}
                          </p>
                          {reminder.tournament && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Trophy size={12} />
                              {reminder.tournament.name}
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock size={12} />
                              {formatTime(reminder.reminderTime)}
                            </div>
                            {reminder.recurrence !== 'none' && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Repeat size={10} />
                                {getRecurrenceLabel(reminder.recurrence)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell size={20} weight="bold" className="text-primary" />
                Найближчі нагадування
              </CardTitle>
              <CardDescription>
                Наступні 5 нагадувань
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReminders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Немає активних нагадувань</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => {
                    const reminderDate = new Date(reminder.reminderDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    reminderDate.setHours(0, 0, 0, 0);
                    
                    const diffTime = reminderDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    let timeLabel = '';
                    if (diffDays === 0) {
                      timeLabel = 'Сьогодні';
                    } else if (diffDays === 1) {
                      timeLabel = 'Завтра';
                    } else if (diffDays < 7) {
                      timeLabel = `Через ${diffDays} дн.`;
                    } else {
                      timeLabel = new Date(reminder.reminderDate).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'short',
                      });
                    }
                    
                    return (
                      <div
                        key={reminder.id}
                        className="p-3 rounded-lg border bg-card space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <Bell size={16} className="text-accent mt-0.5 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">
                              {reminder.message}
                            </p>
                            {reminder.tournament && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Trophy size={12} />
                                {reminder.tournament.name}
                              </div>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {timeLabel}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock size={12} />
                                {formatTime(reminder.reminderTime)}
                              </div>
                              {reminder.recurrence !== 'none' && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Repeat size={10} />
                                  {getRecurrenceLabel(reminder.recurrence)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
