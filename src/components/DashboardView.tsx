import { Trophy, Users, UsersThree, Plus } from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useKV } from '@github/spark/hooks';
import { Tournament, Player, Team } from '@/lib/types';

interface DashboardViewProps {
  onNavigate: (view: 'tournaments' | 'players' | 'teams') => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [tournaments] = useKV<Tournament[]>('tournaments', []);
  const [players] = useKV<Player[]>('players', []);
  const [teams] = useKV<Team[]>('teams', []);

  const activeTournaments = (tournaments || []).filter(t => t.status === 'active');
  const completedTournaments = (tournaments || []).filter(t => t.status === 'completed');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Панель керування
        </h2>
        <p className="text-muted-foreground mt-1">
          Огляд поточних турнірів та статистики
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Активні турніри
            </CardTitle>
            <Trophy size={20} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {activeTournaments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTournaments.length} завершено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Всього гравців
            </CardTitle>
            <Users size={20} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {(players || []).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              У базі даних
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Команди
            </CardTitle>
            <UsersThree size={20} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {(teams || []).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Створено команд
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Швидкі дії</CardTitle>
          <CardDescription>Почніть роботу з турнірами</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => onNavigate('tournaments')}
            className="bg-accent text-accent-foreground hover:brightness-110"
          >
            <Plus size={20} />
            Створити турнір
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('players')}
          >
            <Plus size={20} />
            Додати гравця
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('teams')}
          >
            <Plus size={20} />
            Створити команду
          </Button>
        </CardContent>
      </Card>

      {activeTournaments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Активні турніри</CardTitle>
            <CardDescription>Турніри в процесі проведення</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('tournaments')}
                >
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Тур {tournament.currentRound} з {tournament.totalRounds} • {tournament.participants.length} учасників
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {tournament.system === 'swiss' ? 'Швейцарська' : 'Кругова'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tournament.gameType === 'chess' ? 'Шахи' : 'Шашки'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(tournaments || []).length === 0 && (players || []).length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Почніть роботу</CardTitle>
            <CardDescription>
              Створіть ваш перший турнір або додайте гравців до бази даних
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => onNavigate('players')}
                variant="outline"
                className="flex-1"
              >
                <Users size={20} />
                Додати гравців
              </Button>
              <Button
                onClick={() => onNavigate('tournaments')}
                className="flex-1 bg-accent text-accent-foreground hover:brightness-110"
              >
                <Trophy size={20} />
                Створити турнір
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
