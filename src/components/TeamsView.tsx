import { Plus, PencilSimple, Trash, MagnifyingGlass, X, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Team, Player } from '@/lib/types';
import { generateId } from '@/lib/helpers';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

export default function TeamsView() {
  const [teams, setTeams] = useKV<Team[]>('teams', []);
  const [players] = useKV<Player[]>('players', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamPlayers, setTeamPlayers] = useState<{ playerId: string; board: number }[]>([]);
  const [teamReserves, setTeamReserves] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setTeamName('');
    setTeamPlayers([]);
    setTeamReserves([]);
    setEditingTeam(null);
    setSearchQuery('');
  };

  const handleSave = () => {
    if (!teamName.trim()) {
      toast.error('Введіть назву команди');
      return;
    }

    if (editingTeam) {
      setTeams((current) =>
        (current || []).map((t) =>
          t.id === editingTeam.id
            ? { ...t, name: teamName, players: teamPlayers, reserves: teamReserves }
            : t
        )
      );
      toast.success('Команду оновлено');
    } else {
      const newTeam: Team = {
        id: generateId(),
        name: teamName,
        players: teamPlayers,
        reserves: teamReserves,
      };
      setTeams((current) => [...(current || []), newTeam]);
      toast.success('Команду створено');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamPlayers([...team.players]);
    setTeamReserves([...team.reserves]);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTeams((current) => (current || []).filter((t) => t.id !== id));
    toast.success('Команду видалено');
  };

  const getPlayerName = (playerId: string) => {
    const player = (players || []).find((p) => p.id === playerId);
    return player ? `${player.surname} ${player.name}` : 'Невідомий гравець';
  };

  const getPlayer = (playerId: string) => {
    return (players || []).find((p) => p.id === playerId);
  };

  const addPlayerToBoard = (playerId: string) => {
    if (teamPlayers.some(p => p.playerId === playerId) || teamReserves.includes(playerId)) {
      toast.error('Гравець вже доданий до команди');
      return;
    }
    const nextBoard = teamPlayers.length > 0 ? Math.max(...teamPlayers.map(p => p.board)) + 1 : 1;
    setTeamPlayers([...teamPlayers, { playerId, board: nextBoard }]);
    toast.success('Гравця додано до основного складу');
  };

  const addPlayerToReserves = (playerId: string) => {
    if (teamPlayers.some(p => p.playerId === playerId) || teamReserves.includes(playerId)) {
      toast.error('Гравець вже доданий до команди');
      return;
    }
    setTeamReserves([...teamReserves, playerId]);
    toast.success('Гравця додано до запасу');
  };

  const removePlayerFromBoard = (playerId: string) => {
    const removed = teamPlayers.find(p => p.playerId === playerId);
    if (!removed) return;
    
    const updated = teamPlayers
      .filter(p => p.playerId !== playerId)
      .map(p => ({
        ...p,
        board: p.board > removed.board ? p.board - 1 : p.board
      }));
    setTeamPlayers(updated);
    toast.success('Гравця видалено з основного складу');
  };

  const removePlayerFromReserves = (playerId: string) => {
    setTeamReserves(teamReserves.filter(id => id !== playerId));
    toast.success('Гравця видалено із запасу');
  };

  const movePlayerUp = (playerId: string) => {
    const index = teamPlayers.findIndex(p => p.playerId === playerId);
    if (index <= 0) return;
    
    const updated = [...teamPlayers];
    [updated[index - 1].board, updated[index].board] = [updated[index].board, updated[index - 1].board];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setTeamPlayers(updated);
  };

  const movePlayerDown = (playerId: string) => {
    const index = teamPlayers.findIndex(p => p.playerId === playerId);
    if (index < 0 || index >= teamPlayers.length - 1) return;
    
    const updated = [...teamPlayers];
    [updated[index].board, updated[index + 1].board] = [updated[index + 1].board, updated[index].board];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setTeamPlayers(updated);
  };

  const filteredPlayers = (players || []).filter((player) => {
    const query = searchQuery.toLowerCase();
    return (
      player.name.toLowerCase().includes(query) ||
      player.surname.toLowerCase().includes(query) ||
      player.lastname.toLowerCase().includes(query) ||
      player.uniqCode.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Команди
          </h2>
          <p className="text-muted-foreground mt-1">
            Управління командами для командних турнірів
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:brightness-110" data-tutorial="create-team">
              <Plus size={20} />
              Створити команду
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Редагувати команду' : 'Нова команда'}</DialogTitle>
              <DialogDescription>
                Введіть назву команди та оберіть гравців
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Назва команди *</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Наприклад: Динамо Київ"
                />
              </div>

              <Tabs defaultValue="lineup" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lineup">
                    Основний склад ({teamPlayers.length})
                  </TabsTrigger>
                  <TabsTrigger value="reserves">
                    Запас ({teamReserves.length})
                  </TabsTrigger>
                  <TabsTrigger value="add">
                    Додати гравців
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lineup" className="space-y-3">
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    {teamPlayers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Немає гравців в основному складі
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {teamPlayers
                          .sort((a, b) => a.board - b.board)
                          .map((tp, index) => {
                            const player = getPlayer(tp.playerId);
                            if (!player) return null;
                            return (
                              <div
                                key={tp.playerId}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                              >
                                <Badge variant="outline" className="w-20 justify-center">
                                  Дошка {tp.board}
                                </Badge>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {player.surname} {player.name} {player.lastname}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Рейтинг: {player.rating || '—'} • {player.gender}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => movePlayerUp(tp.playerId)}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => movePlayerDown(tp.playerId)}
                                    disabled={index === teamPlayers.length - 1}
                                  >
                                    <ArrowDown size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removePlayerFromBoard(tp.playerId)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="reserves" className="space-y-3">
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    {teamReserves.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Немає гравців у запасі
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {teamReserves.map((playerId) => {
                          const player = getPlayer(playerId);
                          if (!player) return null;
                          return (
                            <div
                              key={playerId}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {player.surname} {player.name} {player.lastname}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Рейтинг: {player.rating || '—'} • {player.gender}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removePlayerFromReserves(playerId)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="add" className="space-y-3">
                  <div className="relative">
                    <MagnifyingGlass
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={20}
                    />
                    <Input
                      placeholder="Пошук за ПІБ або кодом..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    {filteredPlayers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'Гравців не знайдено' : 'Немає доступних гравців'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredPlayers.map((player) => {
                          const isInTeam = teamPlayers.some(p => p.playerId === player.id) || 
                                          teamReserves.includes(player.id);
                          return (
                            <div
                              key={player.id}
                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                isInTeam ? 'bg-muted/50 opacity-60' : 'bg-muted'
                              }`}
                            >
                              <Badge variant="outline" className="font-mono">
                                {player.uniqCode}
                              </Badge>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {player.surname} {player.name} {player.lastname}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Рейтинг: {player.rating || '—'} • {player.gender}
                                </div>
                              </div>
                              {!isInTeam && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addPlayerToBoard(player.id)}
                                  >
                                    До складу
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addPlayerToReserves(player.id)}
                                  >
                                    У запас
                                  </Button>
                                </div>
                              )}
                              {isInTeam && (
                                <Badge variant="secondary">Додано</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground hover:brightness-110">
                  {editingTeam ? 'Зберегти' : 'Створити'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Скасувати
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Всі команди</CardTitle>
          <CardDescription>
            {(teams || []).length} {(teams || []).length === 1 ? 'команда' : 'команд'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(teams || []).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Команди ще не створені
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(teams || []).map((team, index) => (
                <Card key={team.id} data-tutorial={index === 0 ? "team-card" : undefined}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>
                          {team.players.length} гравців на дошках, {team.reserves.length} у запасі
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(team)}
                        >
                          <PencilSimple size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(team.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {team.players.length === 0 && team.reserves.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Команда порожня
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {team.players.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                              Основний склад:
                            </p>
                            <div className="space-y-1">
                              {team.players.map((p) => (
                                <div key={p.playerId} className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-16">
                                    Дошка {p.board}
                                  </Badge>
                                  <span className="text-sm">
                                    {getPlayerName(p.playerId)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {team.reserves.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                              Запас:
                            </p>
                            <div className="space-y-1">
                              {team.reserves.map((playerId) => (
                                <div key={playerId} className="text-sm">
                                  {getPlayerName(playerId)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
