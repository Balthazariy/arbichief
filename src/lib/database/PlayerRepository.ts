import { BaseRepository } from './BaseRepository';
import { Player } from '../types';

export class PlayerRepository extends BaseRepository<Player> {
  constructor(connection: IDBDatabase) {
    super('players', connection);
  }

  async findByUniqCode(code: string): Promise<Player | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('uniqCode');
      const request = index.get(code);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async findBySurname(surname: string): Promise<Player[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('surname');
      const request = index.getAll(surname);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async findByRatingRange(minRating: number, maxRating: number): Promise<Player[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('rating');
      const range = IDBKeyRange.bound(minRating, maxRating);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async search(query: string): Promise<Player[]> {
    const allPlayers = await this.findAll();
    const lowerQuery = query.toLowerCase();
    
    return allPlayers.filter(player => 
      player.name.toLowerCase().includes(lowerQuery) ||
      player.surname.toLowerCase().includes(lowerQuery) ||
      player.lastname.toLowerCase().includes(lowerQuery) ||
      player.uniqCode.toLowerCase().includes(lowerQuery)
    );
  }
}
