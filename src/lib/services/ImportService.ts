import { Tournament, Match, Player, Reminder } from '../types';

export interface ImportData {
  tournament?: Tournament;
  players?: Player[];
  matches?: Match[];
  standings?: any[];
  reminders?: Reminder[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: ImportData;
  errors?: string[];
}

export interface ImportValidator {
  validate(data: any): ImportResult;
}

export class JSONImportValidator implements ImportValidator {
  validate(data: any): ImportResult {
    const errors: string[] = [];

    if (!data.tournament) {
      errors.push('Відсутня інформація про турнір');
    } else {
      if (!data.tournament.name) errors.push('Відсутня назва турніру');
      if (!data.tournament.gameType) errors.push('Відсутній тип гри');
      if (!data.tournament.format) errors.push('Відсутній формат турніру');
      if (!data.tournament.system) errors.push('Відсутня система турніру');
    }

    if (!data.players || !Array.isArray(data.players)) {
      errors.push('Відсутній список гравців або невірний формат');
    }

    if (!data.matches || !Array.isArray(data.matches)) {
      errors.push('Відсутній список партій або невірний формат');
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Помилки валідації JSON файлу',
        errors,
      };
    }

    return {
      success: true,
      message: 'JSON файл валідний',
      data: data as ImportData,
    };
  }
}

export class CSVImportValidator implements ImportValidator {
  validate(data: any): ImportResult {
    return {
      success: false,
      message: 'Імпорт CSV поки що не підтримується',
      errors: ['Використовуйте JSON формат для імпорту даних'],
    };
  }
}

export class ImportService {
  private validator: ImportValidator;

  constructor(validator: ImportValidator) {
    this.validator = validator;
  }

  setValidator(validator: ImportValidator): void {
    this.validator = validator;
  }

  async importFromFile(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        return this.validator.validate(data);
      } else if (file.name.endsWith('.csv')) {
        return {
          success: false,
          message: 'CSV імпорт поки що не підтримується',
          errors: ['Використовуйте JSON формат'],
        };
      } else {
        return {
          success: false,
          message: 'Непідтримуваний формат файлу',
          errors: ['Підтримуються тільки JSON файли'],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Помилка читання файлу',
        errors: [error instanceof Error ? error.message : 'Невідома помилка'],
      };
    }
  }

  async mergeImportedData(
    importedData: ImportData,
    existingTournaments: Tournament[],
    existingPlayers: Player[],
    existingMatches: Match[]
  ): Promise<{
    tournament: Tournament;
    newPlayers: Player[];
    newMatches: Match[];
  }> {
    const result = {
      tournament: importedData.tournament!,
      newPlayers: [] as Player[],
      newMatches: [] as Match[],
    };

    result.tournament.id = this.generateNewId();
    result.tournament.status = 'draft';
    result.tournament.currentRound = 1;

    const playerIdMap = new Map<string, string>();

    if (importedData.players) {
      for (const player of importedData.players) {
        const existingPlayer = existingPlayers.find(
          p => p.uniqCode === player.uniqCode || 
               (p.surname === player.surname && p.name === player.name)
        );

        if (existingPlayer) {
          playerIdMap.set(player.id, existingPlayer.id);
        } else {
          const newPlayerId = this.generateNewId();
          playerIdMap.set(player.id, newPlayerId);
          result.newPlayers.push({
            ...player,
            id: newPlayerId,
          });
        }
      }
    }

    result.tournament.participants = result.tournament.participants.map(
      oldId => playerIdMap.get(oldId) || oldId
    );

    if (importedData.matches) {
      for (const match of importedData.matches) {
        const newMatch: Match = {
          ...match,
          id: this.generateNewId(),
          tournamentId: result.tournament.id,
          whiteId: match.whiteId ? playerIdMap.get(match.whiteId) || match.whiteId : null,
          blackId: match.blackId ? playerIdMap.get(match.blackId) || match.blackId : null,
          result: null,
        };
        result.newMatches.push(newMatch);
      }
    }

    return result;
  }

  private generateNewId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
