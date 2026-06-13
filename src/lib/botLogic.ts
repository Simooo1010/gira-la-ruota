import { GameState } from '../types';
import { GameAction } from './gameLogic';

const FREQUENT_CONSONANTS_IT = ['R', 'T', 'S', 'N', 'L', 'C', 'M', 'P', 'D', 'V', 'G', 'F', 'B', 'Z', 'H', 'Q', 'X', 'K', 'Y', 'W', 'J'];
const FREQUENT_CONSONANTS_EN = ['T', 'N', 'S', 'H', 'R', 'D', 'L', 'C', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z'];

export const getBotAction = (state: GameState): GameAction | null => {
  if (state.status !== 'playing' || !state.currentPhrase) return null;
  
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.type !== 'bot') return null;

  if (state.turnState === 'waiting_spin') {
    const diff = state.difficulty;
    const revealedPct = getRevealedPercentage(state);
    
    if (diff === 'hard' && revealedPct > 0.4) {
      return { type: 'SOLVE_PHRASE', payload: { guess: state.currentPhrase.text } };
    }
    if (diff === 'medium' && revealedPct > 0.7 && Math.random() > 0.5) {
      return { type: 'SOLVE_PHRASE', payload: { guess: state.currentPhrase.text } };
    }

    return { type: 'SPIN_WHEEL' };
  }

  if (state.turnState === 'waiting_action') return null;

  if (state.turnState === 'waiting_letter') {
    const isEn = state.language === 'en';
    const freqConsonants = isEn ? FREQUENT_CONSONANTS_EN : FREQUENT_CONSONANTS_IT;
    
    const availableConsonants = freqConsonants.filter(c => !state.guessedConsonants.includes(c));
    
    if (availableConsonants.length === 0) {
      return { type: 'SPIN_WHEEL' }; // Fallback
    }

    let chosen = availableConsonants[0];
    if (state.difficulty === 'easy') {
      chosen = availableConsonants[Math.floor(Math.random() * availableConsonants.length)];
    } else if (state.difficulty === 'hard') {
      const goodConsonants = availableConsonants.filter(c => state.currentPhrase?.text.toUpperCase().includes(c));
      if (goodConsonants.length > 0) {
        chosen = goodConsonants[0];
      }
    }

    return { type: 'GUESS_CONSONANT', payload: { letter: chosen } };
  }
  
  return null;
};

const getRevealedPercentage = (state: GameState): number => {
  if (!state.currentPhrase) return 0;
  const text = state.currentPhrase.text.toUpperCase().replace(/[^A-Z]/g, '');
  let revealed = 0;
  for (const char of text) {
    if (state.guessedConsonants.includes(char) || state.guessedVowels.includes(char)) {
      revealed++;
    }
  }
  return revealed / text.length;
};
