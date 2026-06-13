export type Language = 'it' | 'en';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PlayerType = 'human' | 'bot';
export type GameMode = '1_round' | 'half_game' | 'full_game';
export type TurnState = 'waiting_spin' | 'waiting_letter' | 'waiting_action' | 'waiting_solve';
export type GameStatus = 'lobby' | 'playing' | 'round_over' | 'game_over';
export type SpinResult = number | 'Passa' | 'Bancarotta' | 'Jolly';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  score: number;
  totalScore: number;
  hasJolly: boolean;
  connected: boolean;
}

export interface Phrase {
  id: string;
  category: string;
  text: string;
  language: Language;
  difficulty: Difficulty;
}

export interface GameState {
  roomId: string;
  status: GameStatus;
  mode: GameMode;
  language: Language;
  difficulty: Difficulty;
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;
  maxRounds: number;
  currentPhrase: Phrase | null;
  guessedConsonants: string[];
  guessedVowels: string[];
  spinResult: SpinResult | null;
  turnState: TurnState;
  hostId: string;
  winnerId: string | null;
  lastMessage: string;
}
