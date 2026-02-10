import { ArrowLeft, Plus, Shuffle, Trophy, DownloadSimple, CheckCircle, Circle } from '@phosphor-icons/react';
import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tournament, Player, Match, MatchResult, Team } from '@/lib/types';
import { generateSwissPairings, generateRoundRobinPairings, calculateStandings } from '@/lib/tournament';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { toast } from 'sonner';
import ReminderManager from './ReminderManager';

interface TournamentDetailProps {
  tournament: Tournament;
  onBack: () => void;
  onUpdate: (tournament: Tournament) => void;
}

export default function TournamentDetail({ tournament, onBack, onUpdate }: TournamentDetailProps) {
  const [players] = useKV<Player[]>('players', []);
  const [teams] = useKV<Team[]>('teams', []);
  const [matches, setMatches] = useKV<Match[]>(`matches-${tournament.id}`, []);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(tournament.participants);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(tournament.teamParticipants || []);
  const [resultDialog, setResultDialog] = useState<{ open: boolean; match: Match | null }>({
    open: false,
    match: null,
  });
  const [selectedResult, setSelectedResult] = useState<MatchResult>(null);

  const handleAddParticipants = () => {
    if (tournament.format === 'team') {
      const updated = { ...tournament, teamParticipants: selectedTeams };
      onUpdate(updated);
      toast.success('Команди оновлено');
    } else {
      const updated = { ...tournament, participants: selectedPlayers };
      onUpdate(updated);
      toast.success('Учасників оновлено');
    }
  };

  const handleStartTournament = () => {
    const participantCount = tournament.format === 'team' 
      ? (tournament.teamParticipants?.length || 0)
      : tournament.participants.length;

    if (participantCount < 2) {
      toast.error(tournament.format === 'team' ? 'Додайте принаймні 2 команди' : 'Додайте принаймні 2 учасники');
      return;
    }

    let newMatches: Match[] = [];
    const participantsForPairing = tournament.format === 'team' 
      ? (tournament.teamParticipants || [])
      : tournament.participants;
    
    if (tournament.system === 'roundrobin') {
      newMatches = generateRoundRobinPairings(
        participantsForPairing,
        tournament.id,
        tournament.totalRounds
      );
    } else {
      newMatches = generateSwissPairings(
        participantsForPairing,
        [],
        1,
        tournament.id,
        players || []
      );
    }

    setMatches(() => newMatches);
    const updated = { ...tournament, status: 'active' as const, currentRound: 1 };
    onUpdate(updated);
    toast.success('Турнір розпочато');
  };

  const handleGenerateNextRound = () => {
    if (tournament.system === 'roundrobin') {
      toast.info('Усі пари для кругової системи вже згенеровані');
      return;
    }

    const currentRoundMatches = (matches || []).filter(m => m.round === tournament.currentRound);
    const allResultsEntered = currentRoundMatches.every(m => m.result !== null);

    if (!allResultsEntered) {
      toast.error('Введіть результати всіх партій поточного туру');
      return;
    }

    if (tournament.currentRound >= tournament.totalRounds) {
      toast.error('Досягнуто максимальну кількість турів');
      return;
    }

    const nextRound = tournament.currentRound + 1;
    const participantsForPairing = tournament.format === 'team' 
      ? (tournament.teamParticipants || [])
      : tournament.participants;
    
    const newPairings = generateSwissPairings(
      participantsForPairing,
      matches || [],
      nextRound,
      tournament.id,
      players || []
    );

    setMatches((current) => [...(current || []), ...newPairings]);
    const updated = { ...tournament, currentRound: nextRound };
    onUpdate(updated);
    toast.success(`Тур ${nextRound} згенеровано`);
  };

  const handleSaveResult = () => {
    if (!resultDialog.match || !selectedResult) {
      toast.error('Оберіть результат');
      return;
    }

    setMatches((current) =>
      (current || []).map((m) =>
        m.id === resultDialog.match!.id ? { ...m, result: selectedResult } : m
      )
    );

    toast.success('Результат збережено');
    setResultDialog({ open: false, match: null });
    setSelectedResult(null);
  };

  const handleCompleteTournament = () => {
    const updated = { ...tournament, status: 'completed' as const };
    onUpdate(updated);
    toast.success('Турнір завершено');
  };

  const handleExport = (format: 'json' | 'csv') => {
    const participants = tournament.format === 'team' 
      ? (tournament.teamParticipants || [])
      : tournament.participants;
    const standings = calculateStandings(participants, matches || []);
    const playersMap = new Map((players || []).map(p => [p.id, p]));
    const teamsMap = new Map((teams || []).map(t => [t.id, t]));

    if (format === 'json') {
      const data = {
        tournament,
        standings: standings.map(s => {
          if (tournament.format === 'team') {
            return {
              team: teamsMap.get(s.participantId),
              ...s,
            };
          }
          return {
            player: playersMap.get(s.participantId),
            ...s,
          };
        }),
        matches: matches || [],
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tournament.name}-results.json`;
      a.click();
      toast.success('Експорт завершено');
    } else {
      const headerLabel = tournament.format === 'team' ? 'Команда' : 'ПІБ';
      const csvLines = [
        `Місце,${headerLabel},Очки,Партій,Перемог,Нічиїх,Поразок`,
        ...standings.map((s, idx) => {
          let name = 'Невідомий';
          if (tournament.format === 'team') {
            const team = teamsMap.get(s.participantId);
            name = team ? team.name : 'Невідома команда';
          } else {
            const player = playersMap.get(s.participantId);
            name = player ? `${player.surname} ${player.name}` : 'Невідомий';
          }
          return `${idx + 1},${name},${s.points},${s.matchesPlayed},${s.wins},${s.draws},${s.losses}`;
        }),
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tournament.name}-results.csv`;
      a.click();
      toast.success('Експорт завершено');
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams((current) =>
      current.includes(teamId)
        ? current.filter((id) => id !== teamId)
        : [...current, teamId]
    );
  };

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'БАЙ';
    const player = (players || []).find((p) => p.id === playerId);
    return player ? `${player.surname} ${player.name}` : 'Невідомий';
  };

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return 'БАЙ';
    const team = (teams || []).find((t) => t.id === teamId);
    return team ? team.name : 'Невідома команда';
  };

  const getParticipantName = (participantId: string | null) => {
    if (tournament.format === 'team') {
      return getTeamName(participantId);
    }
    return getPlayerName(participantId);
  };

  const currentRoundMatches = (matches || []).filter(m => m.round === tournament.currentRound);
  const participants = tournament.format === 'team' 
    ? (tournament.teamParticipants || [])
    : tournament.participants;
  const standings = calculateStandings(participants, matches || []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {tournament.name}
          </h2>
          <p className="text-muted-foreground mt-1">
            {tournament.gameType === 'chess' ? 'Шахи' : 'Шашки'} •{' '}
            {tournament.system === 'swiss' ? 'Швейцарська' : 'Кругова'} система
          </p>
        </div>
        <div className="flex gap-2">
          {tournament.status === 'active' && (
            <Button variant="outline" onClick={handleCompleteTournament}>
              <Trophy size={20} />
              Завершити турнір
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="participants">Учасники</TabsTrigger>
          <TabsTrigger value="pairings">Пари</TabsTrigger>
          <TabsTrigger value="standings">Таблиця</TabsTrigger>
          <TabsTrigger value="reminders">Нагадування</TabsTrigger>
          <TabsTrigger value="export">Експорт</TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>
                {tournament.format === 'team' ? 'Команди турніру' : 'Учасники турніру'}
              </CardTitle>
              <CardDescription>
                {tournament.format === 'team'
                  ? `${selectedTeams.length} команд обрано`
                  : `${tournament.participants.length} учасників обрано`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tournament.status === 'draft' ? (
                <div className="space-y-4">
                  {tournament.format === 'team' ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {(teams || []).length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          Спочатку створіть команди
                        </p>
                      ) : (
                        (teams || []).map((team) => (
                          <div key={team.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                            <Checkbox
                              id={team.id}
                              checked={selectedTeams.includes(team.id)}
                              onCheckedChange={() => toggleTeamSelection(team.id)}
                            />
                            <Label htmlFor={team.id} className="flex-1 cursor-pointer">
                              <div className="font-medium">{team.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {team.players.length} гравців на дошках, {team.reserves.length} у запасі
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {(players || []).length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          Спочатку додайте гравців у базу даних
                        </p>
                      ) : (
                        (players || []).map((player) => (
                          <div key={player.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                            <Checkbox
                              id={player.id}
                              checked={selectedPlayers.includes(player.id)}
                              onCheckedChange={() => togglePlayerSelection(player.id)}
                            />
                            <Label htmlFor={player.id} className="flex-1 cursor-pointer">
                              {player.surname} {player.name} {player.lastname}
                              <span className="text-muted-foreground ml-2">
                                ({player.rating || 'без рейтингу'})
                              </span>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddParticipants}
                      className="flex-1 bg-accent text-accent-foreground hover:brightness-110"
                      disabled={
                        tournament.format === 'team'
                          ? selectedTeams.length === 0
                          : selectedPlayers.length === 0
                      }
                    >
                      {tournament.format === 'team' ? 'Підтвердити команди' : 'Підтвердити учасників'}
                    </Button>
                    {((tournament.format === 'team' && selectedTeams.length >= 2) ||
                      (tournament.format === 'individual' && tournament.participants.length >= 2)) && (
                      <Button onClick={handleStartTournament} className="flex-1">
                        <Shuffle size={20} />
                        Розпочати турнір
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {tournament.format === 'team' ? (
                    (tournament.teamParticipants || []).map((teamId, idx) => {
                      const team = (teams || []).find((t) => t.id === teamId);
                      return (
                        <div key={teamId} className="flex items-center gap-3 p-3 border rounded">
                          <Badge variant="outline">{idx + 1}</Badge>
                          <div className="flex-1">
                            <div className="font-medium">{getTeamName(teamId)}</div>
                            {team && (
                              <div className="text-sm text-muted-foreground">
                                {team.players.length} гравців на дошках
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    tournament.participants.map((playerId, idx) => (
                      <div key={playerId} className="flex items-center gap-3 p-3 border rounded">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <span className="font-medium">{getPlayerName(playerId)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pairings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Пари туру {tournament.currentRound}</CardTitle>
                  <CardDescription>
                    {currentRoundMatches.length} партій
                  </CardDescription>
                </div>
                {tournament.status === 'active' && tournament.system === 'swiss' && (
                  <Button onClick={handleGenerateNextRound} variant="outline">
                    <Shuffle size={20} />
                    Наступний тур
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentRoundMatches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {tournament.status === 'draft'
                      ? 'Розпочніть турнір для генерації пар'
                      : 'Немає партій у цьому турі'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentRoundMatches.map((match, idx) => (
                    <Card key={match.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Badge variant="outline" className="w-16 justify-center">
                              Партія {idx + 1}
                            </Badge>
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-medium">
                                {getParticipantName(match.whiteId)}
                              </span>
                              <span className="text-muted-foreground">vs</span>
                              <span className="font-medium">
                                {getParticipantName(match.blackId)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {match.result ? (
                              <Badge className="bg-accent text-accent-foreground">
                                {match.result === '1-0' && '1-0'}
                                {match.result === '0-1' && '0-1'}
                                {match.result === '0.5-0.5' && '½-½'}
                                {match.result.includes('forfeit') && 'Тех. поразка'}
                              </Badge>
                            ) : (
                              tournament.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setResultDialog({ open: true, match });
                                    setSelectedResult(null);
                                  }}
                                >
                                  Внести результат
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle>Турнірна таблиця</CardTitle>
              <CardDescription>
                Поточні позиції {tournament.format === 'team' ? 'команд' : 'учасників'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {standings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Таблиця буде доступна після початку турніру
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Місце</TableHead>
                        <TableHead>{tournament.format === 'team' ? 'Команда' : 'Гравець'}</TableHead>
                        <TableHead className="text-center">Очки</TableHead>
                        <TableHead className="text-center">Партії</TableHead>
                        <TableHead className="text-center">+</TableHead>
                        <TableHead className="text-center">=</TableHead>
                        <TableHead className="text-center">-</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((standing, idx) => (
                        <TableRow key={standing.participantId}>
                          <TableCell className="font-bold">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getParticipantName(standing.participantId)}
                          </TableCell>
                          <TableCell className="text-center font-bold text-lg">
                            {standing.points}
                          </TableCell>
                          <TableCell className="text-center">
                            {standing.matchesPlayed}
                          </TableCell>
                          <TableCell className="text-center text-green-600">
                            {standing.wins}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {standing.draws}
                          </TableCell>
                          <TableCell className="text-center text-destructive">
                            {standing.losses}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <ReminderManager tournament={tournament} />
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Експорт результатів</CardTitle>
              <CardDescription>
                Завантажте результати турніру у різних форматах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleExport('json')}
                  variant="outline"
                  className="flex-1"
                  disabled={standings.length === 0}
                >
                  <DownloadSimple size={20} />
                  Експорт JSON
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  className="flex-1"
                  disabled={standings.length === 0}
                >
                  <DownloadSimple size={20} />
                  Експорт CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={resultDialog.open} onOpenChange={(open) => setResultDialog({ open, match: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Внести результат</DialogTitle>
            <DialogDescription>
              {resultDialog.match && (
                <>
                  {getParticipantName(resultDialog.match.whiteId)} vs{' '}
                  {getParticipantName(resultDialog.match.blackId)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Результат</Label>
              <Select value={selectedResult || ''} onValueChange={(v) => setSelectedResult(v as MatchResult)}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть результат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-0">1-0 (Перемога білих)</SelectItem>
                  <SelectItem value="0-1">0-1 (Перемога чорних)</SelectItem>
                  <SelectItem value="0.5-0.5">½-½ (Нічия)</SelectItem>
                  <SelectItem value="forfeit-black">Тех. поразка чорних</SelectItem>
                  <SelectItem value="forfeit-white">Тех. поразка білих</SelectItem>
                  <SelectItem value="double-forfeit">Подвійна тех. поразка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveResult} className="flex-1 bg-accent text-accent-foreground hover:brightness-110">
                <CheckCircle size={20} />
                Зберегти
              </Button>
              <Button variant="outline" onClick={() => setResultDialog({ open: false, match: null })} className="flex-1">
                Скасувати
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
