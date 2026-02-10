import { Plus, PencilSimple, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Player, Gender } from '@/lib/types';
import { generateId, generateUniqueCode } from '@/lib/helpers';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export default function PlayersView() {
  const [players, setPlayers] = useKV<Player[]>('players', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    lastname: '',
    rating: '',
    gender: 'М' as Gender,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      lastname: '',
      rating: '',
      gender: 'М',
    });
    setEditingPlayer(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.surname) {
      toast.error('Будь ласка, заповніть обов\'язкові поля');
      return;
    }

    const rating = parseInt(formData.rating) || 0;

    if (editingPlayer) {
      setPlayers((current) =>
        (current || []).map((p) =>
          p.id === editingPlayer.id
            ? { ...p, ...formData, rating }
            : p
        )
      );
      toast.success('Гравця оновлено');
    } else {
      const newPlayer: Player = {
        id: generateId(),
        ...formData,
        rating,
        uniqCode: generateUniqueCode(),
      };
      setPlayers((current) => [...(current || []), newPlayer]);
      toast.success('Гравця додано');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      surname: player.surname,
      lastname: player.lastname,
      rating: player.rating.toString(),
      gender: player.gender,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPlayers((current) => (current || []).filter((p) => p.id !== id));
    toast.success('Гравця видалено');
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
            Гравці
          </h2>
          <p className="text-muted-foreground mt-1">
            База даних учасників турнірів
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:brightness-110" data-tutorial="add-player">
              <Plus size={20} />
              Додати гравця
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlayer ? 'Редагувати гравця' : 'Новий гравець'}</DialogTitle>
              <DialogDescription>
                Заповніть інформацію про гравця
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="surname">Прізвище *</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  placeholder="Іванов"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Ім'я *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Іван"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">По батькові</Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  placeholder="Іванович"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Рейтинг</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Стать</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="М">Чоловік</SelectItem>
                      <SelectItem value="Ж">Жінка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground hover:brightness-110">
                  {editingPlayer ? 'Зберегти' : 'Додати'}
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
          <CardTitle>Всі гравці</CardTitle>
          <CardDescription>
            {(players || []).length} {(players || []).length === 1 ? 'гравець' : 'гравців'} у базі даних
          </CardDescription>
          <div className="pt-4" data-tutorial="player-search">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Пошук за ім'ям або кодом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent data-tutorial="player-table">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'Гравців не знайдено' : 'Немає гравців у базі даних'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Код</TableHead>
                    <TableHead>ПІБ</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Стать</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {player.uniqCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {player.surname} {player.name} {player.lastname}
                      </TableCell>
                      <TableCell>{player.rating || '—'}</TableCell>
                      <TableCell>{player.gender}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(player)}
                          >
                            <PencilSimple size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(player.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
