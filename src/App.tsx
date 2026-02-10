import { Trophy, Users, UsersThree, Table } from '@phosphor-icons/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import DashboardView from './components/DashboardView';
import TournamentsView from './components/TournamentsView';
import PlayersView from './components/PlayersView';
import TeamsView from './components/TeamsView';

type View = 'dashboard' | 'tournaments' | 'players' | 'teams';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navigation = [
    { id: 'dashboard' as const, label: 'Панель керування', icon: Table },
    { id: 'tournaments' as const, label: 'Турніри', icon: Trophy },
    { id: 'players' as const, label: 'Гравці', icon: Users },
    { id: 'teams' as const, label: 'Команди', icon: UsersThree },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
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
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 border-r border-border bg-card min-h-[calc(100vh-89px)] sticky top-[89px]">
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
                >
                  <Icon size={20} weight={currentView === item.id ? 'fill' : 'regular'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} />}
          {currentView === 'tournaments' && <TournamentsView />}
          {currentView === 'players' && <PlayersView />}
          {currentView === 'teams' && <TeamsView />}
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
