import { GameState, Player, Phrase, Language, Difficulty } from '../types';
import { getRandomPhrase } from './phrases';
import { WEDGE_VALUES, WedgeValue } from '../components/Wheel';

const INITIAL_SCORE = 0;
const VOWEL_COST = 500;

export type GameAction = 
  | { type: 'INIT_LOBBY' }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'START_GAME'; payload: { mode: GameState['mode'], language: Language, difficulty: Difficulty } }
  | { type: 'SPIN_WHEEL' }
  | { type: 'WHEEL_STOPPED'; payload: { result: WedgeValue } }
  | { type: 'GUESS_CONSONANT'; payload: { letter: string } }
  | { type: 'BUY_VOWEL'; payload: { letter: string } }
  | { type: 'SOLVE_PHRASE'; payload: { guess: string } }
  | { type: 'NEXT_ROUND' };

export const initialGameState: GameState = {
  roomId: '',
  status: 'lobby',
  mode: '1_round',
  language: 'it',
  difficulty: 'easy',
  players: [],
  currentPlayerIndex: 0,
  currentRound: 1,
  maxRounds: 1,
  currentPhrase: null,
  guessedConsonants: [],
  guessedVowels: [],
  spinResult: null,
  turnState: 'waiting_spin',
  hostId: '',
  winnerId: null,
  lastMessage: 'Benvenuto in Gira la Ruota Show!'
};

const nextPlayer = (state: GameState): GameState => {
  const nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    ...state,
    currentPlayerIndex: nextIdx,
    turnState: 'waiting_spin',
    spinResult: null,
    lastMessage: `Turno di ${state.players[nextIdx].name}`
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ADD_PLAYER':
      if (state.players.length >= 3) return state;
      return { ...state, players: [...state.players, action.payload] };
      
    case 'START_GAME': {
      const { mode, language, difficulty } = action.payload;
      const maxRounds = mode === '1_round' ? 1 : mode === 'half_game' ? 3 : 5;
      const phrase = getRandomPhrase(language, difficulty);
      
      return {
        ...state,
        status: 'playing',
        mode,
        language,
        difficulty,
        maxRounds,
        currentRound: 1,
        currentPhrase: phrase,
        guessedConsonants: [],
        guessedVowels: [],
        currentPlayerIndex: 0,
        turnState: 'waiting_spin',
        players: state.players.map(p => ({ ...p, score: 0, totalScore: 0, hasJolly: false })),
        lastMessage: 'Il gioco inizia!'
      };
    }
    
    case 'SPIN_WHEEL':
      return { ...state, turnState: 'waiting_action' }; // Intermediate state during animation

    case 'WHEEL_STOPPED': {
      const result = action.payload.result;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (result === 'Bancarotta') {
        const newPlayers = [...state.players];
        newPlayers[state.currentPlayerIndex] = { ...currentPlayer, score: 0 };
        return nextPlayer({ ...state, players: newPlayers, lastMessage: `${currentPlayer.name} ha fatto Bancarotta!` });
      }
      
      if (result === 'Passa') {
        return nextPlayer({ ...state, lastMessage: `${currentPlayer.name} passa il turno!` });
      }
      
      if (result === 'Jolly') {
        const newPlayers = [...state.players];
        newPlayers[state.currentPlayerIndex] = { ...currentPlayer, hasJolly: true };
        // Jolly gives another spin or free turn, let's say they keep their turn to spin again or guess
        return { 
          ...state, 
          players: newPlayers, 
          spinResult: result, 
          turnState: 'waiting_letter',
          lastMessage: `${currentPlayer.name} ha vinto un Jolly! Può scegliere una consonante.`
        };
      }
      
      return { 
        ...state, 
        spinResult: result, 
        turnState: 'waiting_letter',
        lastMessage: `Girata completata: ${result}. Scegli una consonante!` 
      };
    }

    case 'GUESS_CONSONANT': {
      if (!state.currentPhrase) return state;
      const { letter } = action.payload;
      const occurrences = state.currentPhrase.text.toUpperCase().split('').filter(c => c === letter).length;
      
      if (occurrences > 0) {
        const newScore = state.spinResult && typeof state.spinResult === 'number' 
          ? occurrences * state.spinResult 
          : 0; // If they had jolly, maybe 0 points or something, but let's just add 0 for jolly. Actually jolly doesn't give points.
          
        const newPlayers = [...state.players];
        newPlayers[state.currentPlayerIndex].score += newScore;
        
        const newGuessed = [...state.guessedConsonants, letter];
        
        // Check if all letters are revealed automatically? No, players must solve.
        
        return {
          ...state,
          guessedConsonants: newGuessed,
          players: newPlayers,
          turnState: 'waiting_spin',
          spinResult: null,
          lastMessage: `Corretto! ${occurrences} '${letter}'. ${currentPlayerName(state)} guadagna ${newScore}. Tocca ancora a te!`
        };
      } else {
        return nextPlayer({
          ...state,
          guessedConsonants: [...state.guessedConsonants, letter],
          lastMessage: `Sbagliato! Nessuna '${letter}'.`
        });
      }
    }

    case 'BUY_VOWEL': {
      if (!state.currentPhrase) return state;
      const { letter } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (currentPlayer.score < VOWEL_COST) return state;
      
      const occurrences = state.currentPhrase.text.toUpperCase().split('').filter(c => c === letter).length;
      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex].score -= VOWEL_COST;
      
      if (occurrences > 0) {
        return {
          ...state,
          guessedVowels: [...state.guessedVowels, letter],
          players: newPlayers,
          turnState: 'waiting_spin', // Can keep doing actions
          lastMessage: `Corretto! ${occurrences} '${letter}'. Tocca ancora a te!`
        };
      } else {
        return nextPlayer({
          ...state,
          guessedVowels: [...state.guessedVowels, letter],
          players: newPlayers,
          lastMessage: `Sbagliato! Nessuna '${letter}'.`
        });
      }
    }

    case 'SOLVE_PHRASE': {
      if (!state.currentPhrase) return state;
      const { guess } = action.payload;
      const currentText = state.currentPhrase.text.toUpperCase().replace(/[^A-Z]/g, '');
      const guessedText = guess.toUpperCase().replace(/[^A-Z]/g, '');
      
      if (currentText === guessedText) {
        const newPlayers = [...state.players];
        newPlayers[state.currentPlayerIndex].totalScore += newPlayers[state.currentPlayerIndex].score;
        
        return {
          ...state,
          status: 'round_over',
          players: newPlayers,
          winnerId: state.players[state.currentPlayerIndex].id,
          lastMessage: `${currentPlayerName(state)} ha indovinato la frase!`
        };
      } else {
        return nextPlayer({
          ...state,
          lastMessage: `${currentPlayerName(state)} ha dato la soluzione sbagliata!`
        });
      }
    }
    
    case 'NEXT_ROUND': {
      if (state.currentRound >= state.maxRounds) {
        return { ...state, status: 'game_over' };
      }
      
      const nextRound = state.currentRound + 1;
      const phrase = getRandomPhrase(state.language, state.difficulty);
      
      return {
        ...state,
        status: 'playing',
        currentRound: nextRound,
        currentPhrase: phrase,
        guessedConsonants: [],
        guessedVowels: [],
        turnState: 'waiting_spin',
        spinResult: null,
        winnerId: null,
        players: state.players.map(p => ({ ...p, score: 0 })), // Reset round score, keep totalScore
        lastMessage: `Inizia il round ${nextRound}!`
      };
    }

    default:
      return state;
  }
};

const currentPlayerName = (state: GameState) => state.players[state.currentPlayerIndex]?.name || '';
