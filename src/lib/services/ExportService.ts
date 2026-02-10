import { Tournament, Match, Standing, Player, Team } from '../types';

export interface ExportFormat {
  export(data: ExportData): string;
}

export interface ExportData {
  tournament: Tournament;
  players: Player[];
  teams?: Team[];
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
    lines.push('Format,' + (data.tournament.format === 'team' ? 'Team' : 'Individual'));
    lines.push('');
    
    lines.push('Standings');
    const participantLabel = data.tournament.format === 'team' ? 'Team' : 'Player';
    lines.push(`Rank,${participantLabel} ID,Points,Matches Played,Wins,Draws,Losses,Buchholz,Berger,Progressive`);
    
    data.standings.forEach((standing, index) => {
      let participantName = standing.participantId;
      
      if (data.tournament.format === 'team') {
        const team = data.teams?.find(t => t.id === standing.participantId);
        participantName = team ? team.name : standing.participantId;
      } else {
        const player = data.players.find(p => p.id === standing.participantId);
        participantName = player ? `${player.surname} ${player.name}` : standing.participantId;
      }
      
      lines.push([
        index + 1,
        participantName,
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
    const whiteLabel = data.tournament.format === 'team' ? 'White Team' : 'White';
    const blackLabel = data.tournament.format === 'team' ? 'Black Team' : 'Black';
    lines.push(`Round,${whiteLabel},${blackLabel},Result`);
    
    data.matches.forEach(match => {
      let whiteName = 'BYE';
      let blackName = 'BYE';
      
      if (data.tournament.format === 'team') {
        const whiteTeam = data.teams?.find(t => t.id === match.whiteId);
        const blackTeam = data.teams?.find(t => t.id === match.blackId);
        whiteName = whiteTeam ? whiteTeam.name : 'BYE';
        blackName = blackTeam ? blackTeam.name : 'BYE';
      } else {
        const whitePlayer = data.players.find(p => p.id === match.whiteId);
        const blackPlayer = data.players.find(p => p.id === match.blackId);
        whiteName = whitePlayer ? `${whitePlayer.surname} ${whitePlayer.name}` : 'BYE';
        blackName = blackPlayer ? `${blackPlayer.surname} ${blackPlayer.name}` : 'BYE';
      }
      
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
