import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
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

export default function TeamsView() {
  const [teams, setTeams] = useKV<Team[]>('teams', []);
  const [players] = useKV<Player[]>('players', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');

  const resetForm = () => {
    setTeamName('');
    setEditingTeam(null);
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
            ? { ...t, name: teamName }
            : t
        )
      );
      toast.success('Команду оновлено');
    } else {
      const newTeam: Team = {
        id: generateId(),
        name: teamName,
        players: [],
        reserves: [],
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
            <Button className="bg-accent text-accent-foreground hover:brightness-110">
              <Plus size={20} />
              Створити команду
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Редагувати команду' : 'Нова команда'}</DialogTitle>
              <DialogDescription>
                Введіть назву команди
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
              {(teams || []).map((team) => (
                <Card key={team.id}>
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
