import { Match, Player } from '../types';
import { generateId } from '../helpers';

export interface PairingStrategy {
  generatePairings(participants: string[], round: number, previousMatches: Match[]): Match[];
}

export class SwissPairingStrategy implements PairingStrategy {
  private playerRepository: Map<string, Player>;

  constructor(players: Player[]) {
    this.playerRepository = new Map(players.map(p => [p.id, p]));
  }

  generatePairings(participantIds: string[], round: number, previousMatches: Match[]): Match[] {
    const standings = this.calculateCurrentStandings(participantIds, previousMatches);
    const sortedParticipants = this.sortByStandings(standings);
    const paired = new Set<string>();
    const matches: Match[] = [];

    for (let i = 0; i < sortedParticipants.length; i++) {
      const participantA = sortedParticipants[i];
      if (paired.has(participantA)) continue;

      let opponent: string | null = null;
      
      for (let j = i + 1; j < sortedParticipants.length; j++) {
        const participantB = sortedParticipants[j];
        if (paired.has(participantB)) continue;
        
        if (!this.havePlayed(participantA, participantB, previousMatches)) {
          opponent = participantB;
          break;
        }
      }

      if (opponent) {
        paired.add(participantA);
        paired.add(opponent);

        const colorAssignment = this.assignColors(participantA, opponent, previousMatches);
        matches.push({
          id: generateId(),
          tournamentId: '',
          round,
          whiteId: colorAssignment.white,
          blackId: colorAssignment.black,
          result: null,
        });
      } else {
        matches.push({
          id: generateId(),
          tournamentId: '',
          round,
          whiteId: participantA,
          blackId: null,
          result: '1-0',
        });
        paired.add(participantA);
      }
    }

    return matches;
  }

  private havePlayed(participantA: string, participantB: string, matches: Match[]): boolean {
    return matches.some(
      match =>
        (match.whiteId === participantA && match.blackId === participantB) ||
        (match.whiteId === participantB && match.blackId === participantA)
    );
  }

  private assignColors(
    participantA: string,
    participantB: string,
    previousMatches: Match[]
  ): { white: string; black: string } {
    const aWhiteCount = previousMatches.filter(m => m.whiteId === participantA).length;
    const aBlackCount = previousMatches.filter(m => m.blackId === participantA).length;
    const bWhiteCount = previousMatches.filter(m => m.whiteId === participantB).length;
    const bBlackCount = previousMatches.filter(m => m.blackId === participantB).length;

    const aColorBalance = aWhiteCount - aBlackCount;
    const bColorBalance = bWhiteCount - bBlackCount;

    if (aColorBalance < bColorBalance) {
      return { white: participantA, black: participantB };
    } else if (bColorBalance < aColorBalance) {
      return { white: participantB, black: participantA };
    }

    const aRating = this.playerRepository.get(participantA)?.rating || 0;
    const bRating = this.playerRepository.get(participantB)?.rating || 0;
    
    return aRating > bRating
      ? { white: participantA, black: participantB }
      : { white: participantB, black: participantA };
  }

  private calculateCurrentStandings(participantIds: string[], matches: Match[]): Map<string, number> {
    const standings = new Map<string, number>();
    
    participantIds.forEach(id => standings.set(id, 0));

    matches.forEach(match => {
      if (!match.result) return;

      if (match.whiteId) {
        const current = standings.get(match.whiteId) || 0;
        standings.set(match.whiteId, current + this.getPoints(match.result, true));
      }

      if (match.blackId) {
        const current = standings.get(match.blackId) || 0;
        standings.set(match.blackId, current + this.getPoints(match.result, false));
      }
    });

    return standings;
  }

  private getPoints(result: string, isWhite: boolean): number {
    if (result === '1-0') return isWhite ? 1 : 0;
    if (result === '0-1') return isWhite ? 0 : 1;
    if (result === '0.5-0.5') return 0.5;
    if (result === 'forfeit-white') return isWhite ? 0 : 1;
    if (result === 'forfeit-black') return isWhite ? 1 : 0;
    return 0;
  }

  private sortByStandings(standings: Map<string, number>): string[] {
    return Array.from(standings.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        
        const aRating = this.playerRepository.get(a[0])?.rating || 0;
        const bRating = this.playerRepository.get(b[0])?.rating || 0;
        
        return bRating - aRating;
      })
      .map(entry => entry[0]);
  }
}

export class RoundRobinPairingStrategy implements PairingStrategy {
  generatePairings(participantIds: string[], round: number, previousMatches: Match[]): Match[] {
    const matches: Match[] = [];
    const n = participantIds.length;
    
    if (n < 2) return matches;

    const totalRounds = n % 2 === 0 ? n - 1 : n;
    const currentRound = (round - 1) % totalRounds;
    
    const participants = [...participantIds];
    if (participants.length % 2 !== 0) {
      participants.push('BYE');
    }

    const rotated = this.rotateForRound(participants, currentRound);

    for (let i = 0; i < rotated.length / 2; i++) {
      const p1 = rotated[i];
      const p2 = rotated[rotated.length - 1 - i];

      if (p1 !== 'BYE' && p2 !== 'BYE') {
        const isP1White = currentRound % 2 === 0 ? i % 2 === 0 : i % 2 !== 0;
        
        matches.push({
          id: generateId(),
          tournamentId: '',
          round,
          whiteId: isP1White ? p1 : p2,
          blackId: isP1White ? p2 : p1,
          result: null,
        });
      } else if (p1 !== 'BYE') {
        matches.push({
          id: generateId(),
          tournamentId: '',
          round,
          whiteId: p1,
          blackId: null,
          result: '1-0',
        });
      } else if (p2 !== 'BYE') {
        matches.push({
          id: generateId(),
          tournamentId: '',
          round,
          whiteId: p2,
          blackId: null,
          result: '1-0',
        });
      }
    }

    return matches;
  }

  private rotateForRound(participants: string[], round: number): string[] {
    if (round === 0) return participants;

    const fixed = participants[0];
    const rotating = participants.slice(1);

    for (let i = 0; i < round; i++) {
      rotating.unshift(rotating.pop()!);
    }

    return [fixed, ...rotating];
  }
}

export class PairingService {
  private strategy: PairingStrategy;

  constructor(strategy: PairingStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PairingStrategy): void {
    this.strategy = strategy;
  }

  generatePairings(participantIds: string[], round: number, previousMatches: Match[]): Match[] {
    return this.strategy.generatePairings(participantIds, round, previousMatches);
  }
}
