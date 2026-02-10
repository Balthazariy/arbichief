import { Match, MatchResult, Standing, Player } from './types';
import { generateId } from './helpers';

export function calculatePoints(result: MatchResult, isWhite: boolean): number {
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

export function calculateStandings(
  participantIds: string[],
  matches: Match[]
): Standing[] {
  const standings: { [id: string]: Standing } = {};

  participantIds.forEach(id => {
    standings[id] = {
      participantId: id,
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
    };
  });

  matches.forEach(match => {
    if (!match.result || !match.whiteId || !match.blackId) return;

    const whitePoints = calculatePoints(match.result, true);
    const blackPoints = calculatePoints(match.result, false);

    if (match.whiteId in standings) {
      standings[match.whiteId].points += whitePoints;
      standings[match.whiteId].matchesPlayed += 1;
      if (whitePoints === 1) standings[match.whiteId].wins += 1;
      else if (whitePoints === 0.5) standings[match.whiteId].draws += 1;
      else standings[match.whiteId].losses += 1;
    }

    if (match.blackId in standings) {
      standings[match.blackId].points += blackPoints;
      standings[match.blackId].matchesPlayed += 1;
      if (blackPoints === 1) standings[match.blackId].wins += 1;
      else if (blackPoints === 0.5) standings[match.blackId].draws += 1;
      else standings[match.blackId].losses += 1;
    }
  });

  const standingsArray = Object.values(standings);
  standingsArray.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.matchesPlayed - a.matchesPlayed;
  });

  return standingsArray;
}

export function generateSwissPairings(
  participantIds: string[],
  matches: Match[],
  round: number,
  tournamentId: string,
  players: Player[]
): Match[] {
  const standings = calculateStandings(participantIds, matches);
  const paired = new Set<string>();
  const newMatches: Match[] = [];

  const playersMap = new Map(players.map(p => [p.id, p]));

  const sortedParticipants = standings
    .map(s => s.participantId)
    .filter(id => !paired.has(id));

  sortedParticipants.sort((a, b) => {
    const standingA = standings.find(s => s.participantId === a)!;
    const standingB = standings.find(s => s.participantId === b)!;
    
    if (standingB.points !== standingA.points) {
      return standingB.points - standingA.points;
    }
    
    const ratingA = playersMap.get(a)?.rating || 0;
    const ratingB = playersMap.get(b)?.rating || 0;
    return ratingB - ratingA;
  });

  for (let i = 0; i < sortedParticipants.length - 1; i += 2) {
    const white = sortedParticipants[i];
    const black = sortedParticipants[i + 1];

    const alreadyPlayed = matches.some(
      m => 
        (m.whiteId === white && m.blackId === black) ||
        (m.whiteId === black && m.blackId === white)
    );

    if (!alreadyPlayed) {
      newMatches.push({
        id: generateId(),
        tournamentId,
        round,
        whiteId: white,
        blackId: black,
        result: null,
      });
      paired.add(white);
      paired.add(black);
    }
  }

  if (sortedParticipants.length % 2 === 1) {
    const bye = sortedParticipants[sortedParticipants.length - 1];
    if (!paired.has(bye)) {
      newMatches.push({
        id: generateId(),
        tournamentId,
        round,
        whiteId: bye,
        blackId: null,
        result: '1-0',
      });
    }
  }

  return newMatches;
}

export function generateRoundRobinPairings(
  participantIds: string[],
  tournamentId: string,
  totalRounds: number
): Match[] {
  const allMatches: Match[] = [];
  const n = participantIds.length;
  
  if (n < 2) return allMatches;

  const players = [...participantIds];
  if (n % 2 === 1) {
    players.push('BYE');
  }

  const rounds = players.length - 1;
  const halfSize = players.length / 2;

  for (let round = 0; round < rounds && round < totalRounds; round++) {
    for (let i = 0; i < halfSize; i++) {
      const home = players[i];
      const away = players[players.length - 1 - i];

      if (home !== 'BYE' && away !== 'BYE') {
        const isWhiteHome = round % 2 === 0 ? i % 2 === 0 : i % 2 === 1;
        
        allMatches.push({
          id: generateId(),
          tournamentId,
          round: round + 1,
          whiteId: isWhiteHome ? home : away,
          blackId: isWhiteHome ? away : home,
          result: null,
        });
      }
    }

    players.splice(1, 0, players.pop()!);
  }

  return allMatches;
}
