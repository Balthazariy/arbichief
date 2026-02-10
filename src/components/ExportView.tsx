import { DownloadSimple, FileCsv, FileJs, Trophy, Calendar, Users, UploadSimple, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { useState, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tournament, Player, Match } from '@/lib/types';
import { ExportService, JSONExportFormat, CSVExportFormat, ExportData } from '@/lib/services/ExportService';
import { ImportService, JSONImportValidator, ImportResult } from '@/lib/services/ImportService';
import { StandingsCalculator } from '@/lib/services/StandingsService';
import { TieBreakService } from '@/lib/services/TieBreakService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ExportFormatType = 'json' | 'csv';

export default function ExportView() {
  const [tournaments, setTournaments] = useKV<Tournament[]>('tournaments', []);
  const [players, setPlayers] = useKV<Player[]>('players', []);
  const [matches, setMatches] = useKV<Match[]>('matches', []);
  
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTournaments = tournaments?.filter(t => t.status !== 'draft') || [];
  const selectedTournament = tournaments?.find(t => t.id === selectedTournamentId);

  const handleExport = async () => {
    if (!selectedTournamentId) {
      toast.error('Оберіть турнір для експорту');
      return;
    }

    setIsExporting(true);

    try {
      const tournament = tournaments?.find(t => t.id === selectedTournamentId);
      if (!tournament) {
        toast.error('Турнір не знайдено');
        return;
      }

      const tournamentMatches = matches?.filter(m => m.tournamentId === selectedTournamentId) || [];
      const tournamentPlayers = players?.filter(p => tournament.participants.includes(p.id)) || [];

      const standingsCalculator = new StandingsCalculator();
      const tieBreakService = new TieBreakService();
      const standings = standingsCalculator.calculateStandings(
        tournament.participants,
        tournamentMatches
      );
      const standingsWithTieBreaks = tieBreakService.enrichStandingsWithTieBreaks(
        standings,
        tournamentMatches
      );

      const exportData: ExportData = {
        tournament,
        players: tournamentPlayers,
        matches: tournamentMatches,
        standings: standingsWithTieBreaks,
      };

      const exportFormat = selectedFormat === 'json' 
        ? new JSONExportFormat() 
        : new CSVExportFormat();
      
      const exportService = new ExportService(exportFormat);
      const content = exportService.exportTournament(exportData);

      const fileExtension = selectedFormat;
      const fileName = `${tournament.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      
      exportService.downloadFile(content, fileName);

      toast.success(`Турнір експортовано успішно (${fileExtension.toUpperCase()})`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Помилка під час експорту');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    setImportResult(null);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const importService = new ImportService(new JSONImportValidator());
      const result = await importService.importFromFile(file);
      
      setImportResult(result);

      if (result.success && result.data) {
        const mergedData = await importService.mergeImportedData(
          result.data,
          tournaments || [],
          players || [],
          matches || []
        );

        setTournaments((current) => [...(current || []), mergedData.tournament]);
        
        if (mergedData.newPlayers.length > 0) {
          setPlayers((current) => [...(current || []), ...mergedData.newPlayers]);
        }
        
        if (mergedData.newMatches.length > 0) {
          setMatches((current) => [...(current || []), ...mergedData.newMatches]);
        }

        toast.success(`Турнір "${mergedData.tournament.name}" успішно імпортовано!`);
      } else {
        toast.error('Помилка імпорту файлу');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Помилка під час імпорту',
        errors: [error instanceof Error ? error.message : 'Невідома помилка'],
      });
      toast.error('Помилка під час імпорту файлу');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTypes = [
    {
      id: 'json' as ExportFormatType,
      name: 'JSON',
      description: 'Структурований формат для імпорту даних',
      icon: FileJs,
      color: 'text-blue-600',
    },
    {
      id: 'csv' as ExportFormatType,
      name: 'CSV',
      description: 'Таблиці для Excel та Google Sheets',
      icon: FileCsv,
      color: 'text-green-600',
    },
  ];

  const getTournamentStats = (tournament: Tournament) => {
    const tournamentMatches = matches?.filter(m => m.tournamentId === tournament.id) || [];
    const completedMatches = tournamentMatches.filter(m => m.result !== null);
    
    return {
      participants: tournament.participants.length,
      matches: tournamentMatches.length,
      completed: completedMatches.length,
    };
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Експорт та Імпорт турнірів
        </h1>
        <p className="text-muted-foreground mt-2">
          Експортуйте та імпортуйте дані турнірів у JSON форматі для архівування та обміну
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {importResult && (
        <Alert variant={importResult.success ? 'default' : 'destructive'}>
          {importResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <WarningCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {importResult.success ? 'Успішно' : 'Помилка'}
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">{importResult.message}</p>
            {importResult.errors && importResult.errors.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6" data-tutorial="export-section">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                Оберіть турнір
              </CardTitle>
              <CardDescription>
                Виберіть турнір з списку активних та завершених турнірів
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTournaments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Немає доступних турнірів</p>
                  <p className="text-sm mt-1">Створіть турнір, щоб експортувати дані</p>
                </div>
              ) : (
                <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть турнір..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTournaments.map(tournament => {
                      const stats = getTournamentStats(tournament);
                      return (
                        <SelectItem key={tournament.id} value={tournament.id}>
                          <div className="flex items-center gap-2">
                            <span>{tournament.name}</span>
                            <Badge variant={tournament.status === 'completed' ? 'default' : 'secondary'}>
                              {tournament.status === 'completed' ? 'Завершено' : 'Активний'}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}

              {selectedTournament && (
                <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedTournament.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(selectedTournament.startDate).toLocaleDateString('uk-UA')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          {selectedTournament.participants.length} учасників
                        </span>
                      </div>
                    </div>
                    <Badge variant={selectedTournament.status === 'completed' ? 'default' : 'secondary'}>
                      {selectedTournament.status === 'completed' ? 'Завершено' : 'Активний'}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {selectedTournament.currentRound}
                      </div>
                      <div className="text-xs text-muted-foreground">Поточний тур</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {getTournamentStats(selectedTournament).matches}
                      </div>
                      <div className="text-xs text-muted-foreground">Всього партій</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {getTournamentStats(selectedTournament).completed}
                      </div>
                      <div className="text-xs text-muted-foreground">Завершено</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Формат експорту</CardTitle>
              <CardDescription>
                Виберіть формат файлу для експорту даних турніру
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formatTypes.map(format => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.id;
                  
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={cn(
                        'relative rounded-lg border-2 p-4 text-left transition-all duration-150',
                        'hover:border-primary/50 hover:bg-muted/50',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon size={32} className={cn(format.color, 'flex-shrink-0')} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            {format.name}
                            {isSelected && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                Обрано
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Імпорт турніру</CardTitle>
              <CardDescription>
                Завантажте раніше експортований JSON файл турніру
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleImportClick}
                disabled={isImporting}
                className="w-full"
                size="lg"
                variant="secondary"
                data-tutorial="import-button"
              >
                <UploadSimple size={20} weight="bold" className="mr-2" />
                {isImporting ? 'Імпорт...' : 'Імпортувати турнір'}
              </Button>

              <div className="text-xs text-muted-foreground space-y-2 pt-2">
                <p className="font-medium">Що відбудеться при імпорті:</p>
                <ul className="space-y-1 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>Турнір буде створено як новий (чернетка)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>Існуючі гравці будуть повторно використані</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>Нові гравці будуть додані до бази</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <span>Результати партій будуть скинуті</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дії експорту</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleExport}
                disabled={!selectedTournamentId || isExporting}
                className="w-full"
                size="lg"
              >
                <DownloadSimple size={20} weight="bold" className="mr-2" />
                {isExporting ? 'Експорт...' : 'Експортувати турнір'}
              </Button>

              {selectedTournament && (
                <div className="text-xs text-muted-foreground space-y-2 pt-2">
                  <p>
                    <strong>Файл:</strong> {selectedTournament.name.replace(/\s+/g, '_')}_{new Date().toISOString().split('T')[0]}.{selectedFormat}
                  </p>
                  <p>
                    <strong>Формат:</strong> {selectedFormat.toUpperCase()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Що включено в експорт?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Інформація про турнір (назва, дати, система)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Список учасників з рейтингами</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Всі партії та результати</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Турнірна таблиця з очками</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Розрахунок тай-брейків</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
