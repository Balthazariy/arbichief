import { Plus, Trophy, Shuffle, DownloadSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tournament, Player, Match, TournamentFormat, TournamentSystem, GameType } from '@/lib/types';
import { generateId } from '@/lib/helpers';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import TournamentDetail from './TournamentDetail';

export default function TournamentsView() {
  const [tournaments, setTournaments] = useKV<Tournament[]>('tournaments', []);
  const [players] = useKV<Player[]>('players', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    gameType: 'chess' as GameType,
    format: 'individual' as TournamentFormat,
    system: 'swiss' as TournamentSystem,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    totalRounds: '7',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      gameType: 'chess',
      format: 'individual',
      system: 'swiss',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalRounds: '7',
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Введіть назву турніру');
      return;
    }

    const totalRounds = parseInt(formData.totalRounds) || 7;

    const newTournament: Tournament = {
      id: generateId(),
      name: formData.name,
      gameType: formData.gameType,
      format: formData.format,
      system: formData.system,
      startDate: formData.startDate,
      endDate: formData.endDate,
      participants: [],
      currentRound: 0,
      totalRounds,
      status: 'draft',
    };

    setTournaments((current) => [...(current || []), newTournament]);
    toast.success('Турнір створено');
    setDialogOpen(false);
    resetForm();
    setSelectedTournament(newTournament);
  };

  const handleDeleteTournament = (id: string) => {
    setTournaments((current) => (current || []).filter((t) => t.id !== id));
    toast.success('Турнір видалено');
    if (selectedTournament?.id === id) {
      setSelectedTournament(null);
    }
  };

  if (selectedTournament) {
    return (
      <TournamentDetail
        tournament={selectedTournament}
        onBack={() => setSelectedTournament(null)}
        onUpdate={(updated) => {
          setTournaments((current) =>
            (current || []).map((t) => (t.id === updated.id ? updated : t))
          );
          setSelectedTournament(updated);
        }}
      />
    );
  }

  const activeTournaments = (tournaments || []).filter(t => t.status === 'active');
  const draftTournaments = (tournaments || []).filter(t => t.status === 'draft');
  const completedTournaments = (tournaments || []).filter(t => t.status === 'completed');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Турніри
          </h2>
          <p className="text-muted-foreground mt-1">
            Управління шаховими та шашковими турнірами
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:brightness-110" data-tutorial="create-tournament">
              <Plus size={20} />
              Створити турнір
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новий турнір</DialogTitle>
              <DialogDescription>
                Налаштуйте параметри турніру
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tournament-name">Назва турніру *</Label>
                <Input
                  id="tournament-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Наприклад: Чемпіонат міста 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="game-type">Вид гри</Label>
                  <Select
                    value={formData.gameType}
                    onValueChange={(value) => setFormData({ ...formData, gameType: value as GameType })}
                  >
                    <SelectTrigger id="game-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chess">Шахи</SelectItem>
                      <SelectItem value="checkers">Шашки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Формат</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value as TournamentFormat })}
                  >
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Особистий</SelectItem>
                      <SelectItem value="team">Командний</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system">Система проведення</Label>
                <Select
                  value={formData.system}
                  onValueChange={(value) => setFormData({ ...formData, system: value as TournamentSystem })}
                >
                  <SelectTrigger id="system">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="swiss">Швейцарська</SelectItem>
                    <SelectItem value="roundrobin">Кругова</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Дата початку</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Дата закінчення</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-rounds">Кількість турів</Label>
                  <Input
                    id="total-rounds"
                    type="number"
                    min="1"
                    value={formData.totalRounds}
                    onChange={(e) => setFormData({ ...formData, totalRounds: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground hover:brightness-110">
                  Створити турнір
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Скасувати
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(tournaments || []).length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Створіть ваш перший турнір</CardTitle>
            <CardDescription>
              Налаштуйте турнір, додайте учасників та почніть жеребкування
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-accent text-accent-foreground hover:brightness-110"
            >
              <Trophy size={20} />
              Створити турнір
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-4" data-tutorial="tournament-filters">
          <TabsList>
            <TabsTrigger value="active">
              Активні ({activeTournaments.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Чернетки ({draftTournaments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Завершені ({completedTournaments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeTournaments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Немає активних турнірів
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTournaments.map((tournament, index) => (
                  <div key={tournament.id} data-tutorial={index === 0 ? "tournament-card" : undefined}>
                    <TournamentCard
                      tournament={tournament}
                      onSelect={setSelectedTournament}
                      onDelete={handleDeleteTournament}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft">
            {draftTournaments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Немає чернеток турнірів
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onSelect={setSelectedTournament}
                    onDelete={handleDeleteTournament}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedTournaments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Немає завершених турнірів
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onSelect={setSelectedTournament}
                    onDelete={handleDeleteTournament}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
  onDelete: (id: string) => void;
}

function TournamentCard({ tournament, onSelect, onDelete }: TournamentCardProps) {
  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'active':
        return <Badge className="bg-accent text-accent-foreground">Активний</Badge>;
      case 'draft':
        return <Badge variant="outline">Чернетка</Badge>;
      case 'completed':
        return <Badge variant="secondary">Завершено</Badge>;
    }
  };

  const getSystemLabel = () => {
    return tournament.system === 'swiss' ? 'Швейцарська' : 'Кругова';
  };

  const getGameTypeLabel = () => {
    return tournament.gameType === 'chess' ? 'Шахи' : 'Шашки';
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(tournament)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{tournament.name}</CardTitle>
            <CardDescription className="mt-1">
              {getGameTypeLabel()} • {getSystemLabel()}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Учасників:</span>
            <span className="font-medium">{tournament.participants.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Турів:</span>
            <span className="font-medium">
              {tournament.currentRound} / {tournament.totalRounds}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Формат:</span>
            <span className="font-medium">
              {tournament.format === 'individual' ? 'Особистий' : 'Командний'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
