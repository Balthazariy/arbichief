import { getDatabase } from './database';
import { Player, Team, Tournament } from './types';

export class DataMigrationService {
  private migrationKey = 'arbichief_migration_completed';

  async isMigrationCompleted(): Promise<boolean> {
    const completed = localStorage.getItem(this.migrationKey);
    return completed === 'true';
  }

  async markMigrationCompleted(): Promise<void> {
    localStorage.setItem(this.migrationKey, 'true');
  }

  async migrateFromKV(): Promise<void> {
    if (await this.isMigrationCompleted()) {
      return;
    }

    try {
      const playersData = await this.getKVData<Player[]>('players');
      const teamsData = await this.getKVData<Team[]>('teams');
      const tournamentsData = await this.getKVData<Tournament[]>('tournaments');

      const db = await getDatabase();

      if (playersData && playersData.length > 0) {
        for (const player of playersData) {
          try {
            await db.players.create(player);
          } catch (e) {
            console.warn('Player already exists or error:', e);
          }
        }
      }

      if (teamsData && teamsData.length > 0) {
        for (const team of teamsData) {
          try {
            await db.teams.create(team);
          } catch (e) {
            console.warn('Team already exists or error:', e);
          }
        }
      }

      if (tournamentsData && tournamentsData.length > 0) {
        for (const tournament of tournamentsData) {
          try {
            await db.tournaments.create(tournament);
          } catch (e) {
            console.warn('Tournament already exists or error:', e);
          }
        }
      }

      await this.markMigrationCompleted();
      console.log('Data migration from KV to IndexedDB completed');
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  private async getKVData<T>(key: string): Promise<T | null> {
    try {
      if (typeof window !== 'undefined' && window.spark && window.spark.kv) {
        const data = await window.spark.kv.get<T>(key);
        return data || null;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const dataMigrationService = new DataMigrationService();
