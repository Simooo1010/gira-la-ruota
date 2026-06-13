import React from 'react';
import { cn } from '../lib/utils';

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = [
  'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
  'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
];

interface KeyboardProps {
  guessedConsonants: string[];
  guessedVowels: string[];
  onLetterClick: (letter: string, isVowel: boolean) => void;
  disabled: boolean;
  canBuyVowel: boolean;
  isSpinning?: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({ 
  guessedConsonants, 
  guessedVowels, 
  onLetterClick, 
  disabled,
  canBuyVowel,
  isSpinning
}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto p-4 bg-white/10 rounded-xl backdrop-blur-sm">
      <div className="text-white text-sm font-bold uppercase tracking-widest opacity-80">Vocali (Costo: 500)</div>
      <div className="flex flex-wrap justify-center gap-2">
        {VOWELS.map(v => {
          const isGuessed = guessedVowels.includes(v);
          const isDisabled = disabled || isGuessed || !canBuyVowel || isSpinning;
          return (
            <button
              key={v}
              disabled={isDisabled}
              onClick={() => onLetterClick(v, true)}
              className={cn(
                "w-10 h-12 md:w-14 md:h-16 text-xl md:text-2xl font-bold rounded shadow-sm transition-all",
                isGuessed ? "bg-gray-600 text-gray-400 cursor-not-allowed" : 
                isDisabled ? "bg-blue-300/50 text-blue-200/50 cursor-not-allowed" :
                "bg-blue-500 text-white hover:bg-blue-400 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-500/50"
              )}
            >
              {v}
            </button>
          )
        })}
      </div>
      <div className="text-white text-sm font-bold uppercase tracking-widest opacity-80 mt-2">Consonanti</div>
      <div className="flex flex-wrap justify-center gap-2">
        {CONSONANTS.map(c => {
          const isGuessed = guessedConsonants.includes(c);
          const isDisabled = disabled || isGuessed || isSpinning;
          return (
            <button
              key={c}
              disabled={isDisabled}
              onClick={() => onLetterClick(c, false)}
              className={cn(
                "w-10 h-12 md:w-12 md:h-14 text-xl md:text-xl font-bold rounded shadow-sm transition-all",
                isGuessed ? "bg-gray-600 text-gray-400 cursor-not-allowed" : 
                isDisabled ? "bg-yellow-700/50 text-yellow-600/50 cursor-not-allowed" :
                "bg-gameYellow text-black hover:bg-yellow-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-gameYellow/50"
              )}
            >
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}
