import { Tournament, Match, Standing, Player } from '../types';

export interface ExportFormat {
  export(data: ExportData): string;
}

export interface ExportData {
  tournament: Tournament;
  players: Player[];
  matches: Match[];
  standings: Standing[];
}

export class JSONExportFormat implements ExportFormat {
  export(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }
}

export class CSVExportFormat implements ExportFormat {
  export(data: ExportData): string {
    const lines: string[] = [];
    
    lines.push('Tournament,' + data.tournament.name);
    lines.push('');
    
    lines.push('Standings');
    lines.push('Rank,Player ID,Points,Matches Played,Wins,Draws,Losses,Buchholz,Berger,Progressive');
    
    data.standings.forEach((standing, index) => {
      const player = data.players.find(p => p.id === standing.participantId);
      const playerName = player ? `${player.surname} ${player.name}` : standing.participantId;
      
      lines.push([
        index + 1,
        playerName,
        standing.points,
        standing.matchesPlayed,
        standing.wins,
        standing.draws,
        standing.losses,
        standing.buchholz || '',
        standing.berger || '',
        standing.progressive || '',
      ].join(','));
    });
    
    lines.push('');
    lines.push('Matches');
    lines.push('Round,White,Black,Result');
    
    data.matches.forEach(match => {
      const whitePlayer = data.players.find(p => p.id === match.whiteId);
      const blackPlayer = data.players.find(p => p.id === match.blackId);
      
      const whiteName = whitePlayer ? `${whitePlayer.surname} ${whitePlayer.name}` : 'BYE';
      const blackName = blackPlayer ? `${blackPlayer.surname} ${blackPlayer.name}` : 'BYE';
      
      lines.push([
        match.round,
        whiteName,
        blackName,
        match.result || 'Not played',
      ].join(','));
    });
    
    return lines.join('\n');
  }
}

export class ExportService {
  private format: ExportFormat;

  constructor(format: ExportFormat) {
    this.format = format;
  }

  setFormat(format: ExportFormat): void {
    this.format = format;
  }

  exportTournament(data: ExportData): string {
    return this.format.export(data);
  }

  downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
