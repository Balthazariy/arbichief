export type Gender = 'М' | 'Ж';

export interface Player {
  id: string;
  name: string;
  surname: string;
  lastname: string;
  uniqCode: string;
  rating: number;
  gender: Gender;
}

export interface Team {
  id: string;
  name: string;
  players: {
    playerId: string;
    board: number;
  }[];
  reserves: string[];
}

export type TournamentFormat = 'individual' | 'team';
export type TournamentSystem = 'swiss' | 'roundrobin';
export type GameType = 'chess' | 'checkers';

export interface Tournament {
  id: string;
  name: string;
  gameType: GameType;
  format: TournamentFormat;
  system: TournamentSystem;
  startDate: string;
  endDate: string;
  participants: string[];
  currentRound: number;
  totalRounds: number;
  status: 'draft' | 'active' | 'completed';
}

export type MatchResult = '1-0' | '0-1' | '0.5-0.5' | 'forfeit-white' | 'forfeit-black' | 'double-forfeit' | null;

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  whiteId: string | null;
  blackId: string | null;
  result: MatchResult;
  board?: number;
}

export interface Standing {
  participantId: string;
  points: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  buchholz?: number;
  berger?: number;
  progressive?: number;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Reminder {
  id: string;
  tournamentId: string;
  reminderDate: string;
  reminderTime: string;
  message: string;
  isEnabled: boolean;
  notified: boolean;
  recurrence: RecurrenceType;
  lastNotified?: string;
}
