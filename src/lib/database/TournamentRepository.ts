import { BaseRepository } from './BaseRepository';
import { Tournament } from '../types';

export class TournamentRepository extends BaseRepository<Tournament> {
  constructor(connection: IDBDatabase) {
    super('tournaments', connection);
  }

  async findByStatus(status: 'draft' | 'active' | 'completed'): Promise<Tournament[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Tournament[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('startDate');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async findActive(): Promise<Tournament[]> {
    return this.findByStatus('active');
  }

  async findCompleted(): Promise<Tournament[]> {
    return this.findByStatus('completed');
  }

  async findDrafts(): Promise<Tournament[]> {
    return this.findByStatus('draft');
  }
}
