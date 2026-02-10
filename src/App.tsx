import { Trophy, Users, UsersThree, Table, DownloadSimple, Moon, Sun, CalendarBlank } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { dataMigrationService } from '@/lib/migration';
import { useTheme } from '@/hooks/use-theme';
import { useReminders } from '@/hooks/use-reminders';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import DashboardView from './components/DashboardView';
import TournamentsView from './components/TournamentsView';
import PlayersView from './components/PlayersView';
import TeamsView from './components/TeamsView';
import ExportView from './components/ExportView';
import CalendarView from './components/CalendarView';
import { TutorialOverlay } from './components/TutorialOverlay';
import { tutorialSteps } from './lib/tutorial';

type View = 'dashboard' | 'tournaments' | 'players' | 'teams' | 'export' | 'calendar';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMigrating, setIsMigrating] = useState(true);
  const { theme, toggleTheme } = useTheme();
  useReminders();
  
  const [tutorialCompleted, setTutorialCompleted] = useKV<boolean>('tutorial-completed', false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  useEffect(() => {
    const runMigration = async () => {
      try {
        await dataMigrationService.migrateFromKV();
      } catch (error) {
        console.error('Migration failed:', error);
      } finally {
        setIsMigrating(false);
      }
    };

    runMigration();
  }, []);

  useEffect(() => {
    if (!isMigrating && !tutorialCompleted) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMigrating, tutorialCompleted]);

  useEffect(() => {
    const currentStep = tutorialSteps[currentTutorialStep];
    if (currentStep?.view && currentStep.view !== currentView) {
      setCurrentView(currentStep.view);
    }
  }, [currentTutorialStep]);

  const handleTutorialNext = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    }
  };

  const handleTutorialPrevious = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setCurrentTutorialStep(0);
    setTutorialCompleted((prev) => true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setCurrentTutorialStep(0);
    setTutorialCompleted((prev) => true);
  };

  const startTutorial = () => {
    setCurrentTutorialStep(0);
    setShowTutorial(true);
    setCurrentView('dashboard');
  };

  if (isMigrating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy size={48} className="text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Завантаження ArbiChief...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard' as const, label: 'Панель керування', icon: Table },
    { id: 'tournaments' as const, label: 'Турніри', icon: Trophy },
    { id: 'players' as const, label: 'Гравці', icon: Users },
    { id: 'teams' as const, label: 'Команди', icon: UsersThree },
    { id: 'calendar' as const, label: 'Календар', icon: CalendarBlank },
    { id: 'export' as const, label: 'Експорт', icon: DownloadSimple },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      {showTutorial && (
        <TutorialOverlay
          step={tutorialSteps[currentTutorialStep]}
          currentStepIndex={currentTutorialStep}
          totalSteps={tutorialSteps.length}
          onNext={handleTutorialNext}
          onPrevious={handleTutorialPrevious}
          onSkip={handleTutorialSkip}
          onComplete={handleTutorialComplete}
        />
      )}
      <header className="border-b border-border bg-card sticky top-0 z-40" data-tutorial="header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={32} weight="bold" className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  ArbiChief
                </h1>
                <p className="text-sm text-muted-foreground">
                  Менеджер шахових та шашкових турнірів
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
              aria-label="Перемкнути тему"
              data-tutorial="theme-toggle"
            >
              {theme === 'light' ? (
                <Moon size={20} weight="regular" />
              ) : (
                <Sun size={20} weight="regular" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 border-r border-border bg-card min-h-[calc(100vh-89px)] sticky top-[89px]" data-tutorial="navigation">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150',
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted'
                  )}
                  data-tutorial={`nav-${item.id}`}
                >
                  <Icon size={20} weight={currentView === item.id ? 'fill' : 'regular'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} onStartTutorial={startTutorial} />}
          {currentView === 'tournaments' && <TournamentsView />}
          {currentView === 'players' && <PlayersView />}
          {currentView === 'teams' && <TeamsView />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'export' && <ExportView />}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-colors duration-150',
                  currentView === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
                data-tutorial={`nav-${item.id}`}
              >
                <Icon size={24} weight={currentView === item.id ? 'fill' : 'regular'} />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
