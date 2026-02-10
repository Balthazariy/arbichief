import { Match, MatchResult, Standing } from '../types';

export class PointsCalculator {
  calculatePoints(result: MatchResult, isWhite: boolean): number {
    if (!result) return 0;

    switch (result) {
      case '1-0':
        return isWhite ? 1 : 0;
      case '0-1':
        return isWhite ? 0 : 1;
      case '0.5-0.5':
        return 0.5;
      case 'forfeit-white':
        return isWhite ? 0 : 1;
      case 'forfeit-black':
        return isWhite ? 1 : 0;
      case 'double-forfeit':
        return 0;
      default:
        return 0;
    }
  }

  calculateMatchOutcome(result: MatchResult): { whitePoints: number; blackPoints: number } {
    const whitePoints = this.calculatePoints(result, true);
    const blackPoints = this.calculatePoints(result, false);
    
    return { whitePoints, blackPoints };
  }
}

export class StandingsCalculator {
  private pointsCalculator: PointsCalculator;

  constructor() {
    this.pointsCalculator = new PointsCalculator();
  }

  calculateStandings(participantIds: string[], matches: Match[]): Standing[] {
    const standings: Map<string, Standing> = new Map();

    participantIds.forEach(id => {
      standings.set(id, {
        participantId: id,
        points: 0,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      });
    });

    matches.forEach(match => {
      if (!match.result) return;

      if (match.whiteId) {
        const whiteStanding = standings.get(match.whiteId)!;
        const points = this.pointsCalculator.calculatePoints(match.result, true);
        
        whiteStanding.points += points;
        whiteStanding.matchesPlayed++;
        
        if (points === 1) whiteStanding.wins++;
        else if (points === 0.5) whiteStanding.draws++;
        else whiteStanding.losses++;
      }

      if (match.blackId) {
        const blackStanding = standings.get(match.blackId)!;
        const points = this.pointsCalculator.calculatePoints(match.result, false);
        
        blackStanding.points += points;
        blackStanding.matchesPlayed++;
        
        if (points === 1) blackStanding.wins++;
        else if (points === 0.5) blackStanding.draws++;
        else blackStanding.losses++;
      }
    });

    return Array.from(standings.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.matchesPlayed - a.matchesPlayed;
    });
  }
}
