import { BaseRepository } from './BaseRepository';
import { Match } from '../types';

export class MatchRepository extends BaseRepository<Match> {
  constructor(connection: IDBDatabase) {
    super('matches', connection);
  }

  async findByTournamentId(tournamentId: string): Promise<Match[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.connection.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('tournamentId');
      const request = index.getAll(tournamentId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async findByTournamentAndRound(tournamentId: string, round: number): Promise<Match[]> {
    const allMatches = await this.findByTournamentId(tournamentId);
    return allMatches.filter(match => match.round === round);
  }

  async findByParticipant(participantId: string): Promise<Match[]> {
    const allMatches = await this.findAll();
    return allMatches.filter(
      match => match.whiteId === participantId || match.blackId === participantId
    );
  }

  async deleteByTournamentId(tournamentId: string): Promise<void> {
    const matches = await this.findByTournamentId(tournamentId);
    
    const deletePromises = matches.map(match => this.delete(match.id));
    await Promise.all(deletePromises);
  }
}
