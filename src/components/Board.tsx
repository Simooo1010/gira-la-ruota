import React from 'react';
import { Phrase } from '../types';
import { cn } from '../lib/utils';

interface BoardProps {
  phrase: Phrase | null;
  revealedLetters: string[];
}

export const Board: React.FC<BoardProps> = ({ phrase, revealedLetters }) => {
  if (!phrase) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-gameBlue border-8 border-gameGold shadow-2xl p-8 min-h-[300px] flex items-center justify-center">
        <h2 className="text-4xl text-white font-bold tracking-widest opacity-50">GIRA LA RUOTA</h2>
      </div>
    );
  }

  const words = phrase.text.split(' ');

  return (
    <div className="w-full max-w-5xl mx-auto bg-gameBlue border-8 border-gameGold shadow-2xl p-4 md:p-8 flex flex-col items-center">
      <div className="bg-gameBlue px-4 py-1 mb-4 border-2 border-white text-white font-bold text-xl uppercase tracking-widest shadow-md">
        {phrase.category}
      </div>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
        {words.map((word, wIdx) => (
          <div key={wIdx} className="flex gap-1">
            {word.split('').map((char, cIdx) => {
              const isRevealed = revealedLetters.includes(char);
              return (
                <div 
                  key={cIdx} 
                  className={cn(
                    "w-10 h-14 md:w-14 md:h-20 lg:w-16 lg:h-24 bg-white flex items-center justify-center text-3xl md:text-4xl lg:text-5xl font-bold",
                    !isRevealed && "text-transparent"
                  )}
                  style={{
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                    color: isRevealed ? '#000' : 'transparent',
                  }}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
