export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export class BaseRepository<T extends { id: string }> {
  protected storeName: string;
  protected connection: IDBDatabase;

  constructor(storeName: string, connection: IDBDatabase) {
    this.storeName = storeName;
    this.connection = connection;
  }

  async create(entity: T): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(entity);

      request.onsuccess = () => resolve(entity);
      request.onerror = () => reject(request.error);
    });
  }

  async findById(id: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;
        
        if (options?.orderBy) {
          results = this.sortResults(results, options.orderBy, options.orderDirection);
        }
        
        if (options?.offset) {
          results = results.slice(options.offset);
        }
        
        if (options?.limit) {
          results = results.slice(0, options.limit);
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async update(entity: T): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entity);

      request.onsuccess = () => resolve(entity);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  protected sortResults(results: T[], key: string, direction: 'asc' | 'desc' = 'asc'): T[] {
    return results.sort((a, b) => {
      const aVal = (a as any)[key];
      const bVal = (b as any)[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
