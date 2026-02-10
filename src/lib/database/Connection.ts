export class DatabaseConnection {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly version: number;

  constructor(dbName: string = 'arbichief', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains('players')) {
      const playerStore = db.createObjectStore('players', { keyPath: 'id' });
      playerStore.createIndex('uniqCode', 'uniqCode', { unique: true });
      playerStore.createIndex('surname', 'surname', { unique: false });
      playerStore.createIndex('rating', 'rating', { unique: false });
    }

    if (!db.objectStoreNames.contains('teams')) {
      db.createObjectStore('teams', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('tournaments')) {
      const tournamentStore = db.createObjectStore('tournaments', { keyPath: 'id' });
      tournamentStore.createIndex('status', 'status', { unique: false });
      tournamentStore.createIndex('startDate', 'startDate', { unique: false });
    }

    if (!db.objectStoreNames.contains('matches')) {
      const matchStore = db.createObjectStore('matches', { keyPath: 'id' });
      matchStore.createIndex('tournamentId', 'tournamentId', { unique: false });
      matchStore.createIndex('round', 'round', { unique: false });
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  getDatabase(): IDBDatabase | null {
    return this.db;
  }
}
