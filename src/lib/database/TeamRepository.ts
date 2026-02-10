import { BaseRepository } from './BaseRepository';
import { Team } from '../types';

export class TeamRepository extends BaseRepository<Team> {
  constructor(connection: IDBDatabase) {
    super('teams', connection);
  }

  async findByPlayerId(playerId: string): Promise<Team[]> {
    const allTeams = await this.findAll();
    
    return allTeams.filter(team => 
      team.players.some(p => p.playerId === playerId) ||
      team.reserves.includes(playerId)
    );
  }

  async isPlayerInTeam(playerId: string, teamId?: string): Promise<boolean> {
    const teams = await this.findByPlayerId(playerId);
    
    if (teamId) {
      return teams.some(team => team.id === teamId);
    }
    
    return teams.length > 0;
  }
}
