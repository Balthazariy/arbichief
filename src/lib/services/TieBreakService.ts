import { Match, Standing } from '../types';

export class TieBreakCalculator {
  calculateBuchholz(participantId: string, matches: Match[], standings: Standing[]): number {
    const opponents = this.getOpponents(participantId, matches);
    const standingsMap = new Map(standings.map(s => [s.participantId, s]));
    
    return opponents.reduce((sum, opponentId) => {
      const opponentStanding = standingsMap.get(opponentId);
      return sum + (opponentStanding?.points || 0);
    }, 0);
  }

  calculateBerger(participantId: string, matches: Match[], standings: Standing[]): number {
    const standingsMap = new Map(standings.map(s => [s.participantId, s]));
    let bergerScore = 0;

    matches.forEach(match => {
      if (!match.result) return;

      let isParticipant = false;
      let opponentId: string | null = null;
      let wonMatch = false;

      if (match.whiteId === participantId) {
        isParticipant = true;
        opponentId = match.blackId;
        wonMatch = match.result === '1-0' || match.result === 'forfeit-black';
      } else if (match.blackId === participantId) {
        isParticipant = true;
        opponentId = match.whiteId;
        wonMatch = match.result === '0-1' || match.result === 'forfeit-white';
      }

      if (isParticipant && wonMatch && opponentId) {
        const opponentStanding = standingsMap.get(opponentId);
        bergerScore += opponentStanding?.points || 0;
      }
    });

    return bergerScore;
  }

  calculateProgressive(participantId: string, matches: Match[]): number {
    const sortedMatches = matches
      .filter(m => m.whiteId === participantId || m.blackId === participantId)
      .sort((a, b) => a.round - b.round);

    let progressive = 0;
    let cumulative = 0;

    sortedMatches.forEach(match => {
      if (!match.result) return;

      const isWhite = match.whiteId === participantId;
      const points = this.getPoints(match.result, isWhite);
      
      cumulative += points;
      progressive += cumulative;
    });

    return progressive;
  }

  private getOpponents(participantId: string, matches: Match[]): string[] {
    const opponents: string[] = [];

    matches.forEach(match => {
      if (match.whiteId === participantId && match.blackId) {
        opponents.push(match.blackId);
      } else if (match.blackId === participantId && match.whiteId) {
        opponents.push(match.whiteId);
      }
    });

    return opponents;
  }

  private getPoints(result: string, isWhite: boolean): number {
    if (result === '1-0') return isWhite ? 1 : 0;
    if (result === '0-1') return isWhite ? 0 : 1;
    if (result === '0.5-0.5') return 0.5;
    if (result === 'forfeit-white') return isWhite ? 0 : 1;
    if (result === 'forfeit-black') return isWhite ? 1 : 0;
    return 0;
  }
}

export class TieBreakService {
  private calculator: TieBreakCalculator;

  constructor() {
    this.calculator = new TieBreakCalculator();
  }

  enrichStandingsWithTieBreaks(standings: Standing[], matches: Match[]): Standing[] {
    return standings.map(standing => ({
      ...standing,
      buchholz: this.calculator.calculateBuchholz(standing.participantId, matches, standings),
      berger: this.calculator.calculateBerger(standing.participantId, matches, standings),
      progressive: this.calculator.calculateProgressive(standing.participantId, matches),
    }));
  }

  sortByTieBreaks(standings: Standing[]): Standing[] {
    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if ((b.buchholz || 0) !== (a.buchholz || 0)) return (b.buchholz || 0) - (a.buchholz || 0);
      if ((b.berger || 0) !== (a.berger || 0)) return (b.berger || 0) - (a.berger || 0);
      if ((b.progressive || 0) !== (a.progressive || 0)) return (b.progressive || 0) - (a.progressive || 0);
      return b.wins - a.wins;
    });
  }
}
