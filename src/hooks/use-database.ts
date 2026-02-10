import { useState, useEffect, useCallback } from 'react';
import { getDatabase } from '@/lib/database';
import { Player, Team, Tournament, Match } from '@/lib/types';
import { BaseRepository } from '@/lib/database/BaseRepository';

type EntityType = Player | Team | Tournament | Match;

export function useDatabase<T extends EntityType>(
  repositoryType: 'players' | 'teams' | 'tournaments' | 'matches'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const repository = db[repositoryType] as unknown as BaseRepository<T>;
      const items = await repository.findAll();
      setData(items);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [repositoryType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const create = useCallback(async (entity: T): Promise<T> => {
    const db = await getDatabase();
    const repository = db[repositoryType] as unknown as BaseRepository<T>;
    const created = await repository.create(entity);
    await loadData();
    return created;
  }, [repositoryType, loadData]);

  const update = useCallback(async (entity: T): Promise<T> => {
    const db = await getDatabase();
    const repository = db[repositoryType] as unknown as BaseRepository<T>;
    const updated = await repository.update(entity);
    await loadData();
    return updated;
  }, [repositoryType, loadData]);

  const remove = useCallback(async (id: string): Promise<void> => {
    const db = await getDatabase();
    const repository = db[repositoryType] as unknown as BaseRepository<T>;
    await repository.delete(id);
    await loadData();
  }, [repositoryType, loadData]);

  const findById = useCallback(async (id: string): Promise<T | null> => {
    const db = await getDatabase();
    const repository = db[repositoryType] as unknown as BaseRepository<T>;
    return repository.findById(id);
  }, [repositoryType]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    findById,
    refresh,
  };
}
