import { DatabaseConnection } from './Connection';
import { PlayerRepository } from './PlayerRepository';
import { TeamRepository } from './TeamRepository';
import { TournamentRepository } from './TournamentRepository';
import { MatchRepository } from './MatchRepository';

export class DatabaseManager {
  private connection: DatabaseConnection;
  private isInitialized: boolean = false;

  private _playerRepository?: PlayerRepository;
  private _teamRepository?: TeamRepository;
  private _tournamentRepository?: TournamentRepository;
  private _matchRepository?: MatchRepository;

  constructor(dbName?: string, version?: number) {
    this.connection = new DatabaseConnection(dbName, version);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.connection.open();
    this.isInitialized = true;
  }

  get players(): PlayerRepository {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._playerRepository) {
      this._playerRepository = new PlayerRepository(this.connection.getDatabase()!);
    }
    return this._playerRepository;
  }

  get teams(): TeamRepository {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._teamRepository) {
      this._teamRepository = new TeamRepository(this.connection.getDatabase()!);
    }
    return this._teamRepository;
  }

  get tournaments(): TournamentRepository {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._tournamentRepository) {
      this._tournamentRepository = new TournamentRepository(this.connection.getDatabase()!);
    }
    return this._tournamentRepository;
  }

  get matches(): MatchRepository {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    if (!this._matchRepository) {
      this._matchRepository = new MatchRepository(this.connection.getDatabase()!);
    }
    return this._matchRepository;
  }

  async close(): Promise<void> {
    await this.connection.close();
    this.isInitialized = false;
    this._playerRepository = undefined;
    this._teamRepository = undefined;
    this._tournamentRepository = undefined;
    this._matchRepository = undefined;
  }
}

let dbInstance: DatabaseManager | null = null;

export async function getDatabase(): Promise<DatabaseManager> {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
    await dbInstance.initialize();
  }
  return dbInstance;
}
