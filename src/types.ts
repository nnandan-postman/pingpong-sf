export interface Player {
  id: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  player1EloChange: number;
  player2EloChange: number;
  date: string;
}

export interface AppData {
  players: Player[];
  matches: Match[];
}
