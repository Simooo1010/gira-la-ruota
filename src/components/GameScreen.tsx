import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { Board } from './Board';
import { Wheel } from './Wheel';
import { Keyboard } from './Keyboard';
import { cn } from '../lib/utils';

export const GameScreen = () => {
  const { state, dispatch } = useGame();
  
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [solveInput, setSolveInput] = useState('');

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isMyTurn = currentPlayer.type === 'human';

  const handleSpin = () => {
    if (!isMyTurn) return;
    setWheelRotation(prev => prev + 1440 + Math.random() * 360); // Spin 4+ times
    dispatch({ type: 'SPIN_WHEEL' });
    // Note: the bot effect simulates wheel stopping, but for humans we need to trigger WHEEL_STOPPED
  };

  // We need an effect to stop the wheel for human players too, or handle it here
  useEffect(() => {
    if (state.turnState === 'waiting_action' && currentPlayer.type === 'human') {
      const timer = setTimeout(() => {
        const { WEDGE_VALUES } = require('./Wheel');
        const result = WEDGE_VALUES[Math.floor(Math.random() * WEDGE_VALUES.length)];
        dispatch({ type: 'WHEEL_STOPPED', payload: { result } });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.turnState, currentPlayer.type, dispatch]);

  // When bot spins, we also want to animate the wheel
  useEffect(() => {
    if (state.turnState === 'waiting_action' && currentPlayer.type === 'bot') {
      setWheelRotation(prev => prev + 1440 + Math.random() * 360);
    }
  }, [state.turnState, currentPlayer.type]);

  const handleLetterClick = (letter: string, isVowel: boolean) => {
    if (!isMyTurn) return;
    if (isVowel) {
      dispatch({ type: 'BUY_VOWEL', payload: { letter } });
    } else {
      dispatch({ type: 'GUESS_CONSONANT', payload: { letter } });
    }
  };

  const handleSolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solveInput.trim()) return;
    dispatch({ type: 'SOLVE_PHRASE', payload: { guess: solveInput } });
    setShowSolveModal(false);
    setSolveInput('');
  };

  const canBuyVowel = currentPlayer.score >= 500;
  const isSpinning = state.turnState === 'waiting_action';

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4">
      
      {/* Header Info */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-white/10 p-4 rounded-xl backdrop-blur-md text-white border border-white/20">
        <div className="font-bold text-xl uppercase tracking-widest text-gameYellow">
          Round {state.currentRound} di {state.maxRounds}
        </div>
        <div className="text-xl font-bold bg-black/50 px-4 py-2 rounded-lg text-center animate-pulse border border-white/10">
          {state.lastMessage}
        </div>
      </div>

      <Board 
        phrase={state.currentPhrase} 
        revealedLetters={[...state.guessedConsonants, ...state.guessedVowels]} 
      />

      <div className="w-full max-w-6xl mt-8 grid lg:grid-cols-3 gap-8">
        
        {/* Players Panel */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          {state.players.map((p, i) => (
            <div 
              key={p.id} 
              className={cn(
                "p-4 rounded-xl border-4 transition-all duration-300",
                i === state.currentPlayerIndex 
                  ? "bg-gameGold/20 border-gameYellow shadow-[0_0_15px_rgba(255,215,0,0.5)] scale-105 z-10" 
                  : "bg-black/40 border-gray-600 opacity-80"
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xl text-white">{p.name}</span>
                <span className="text-xs uppercase bg-white/20 px-2 py-1 rounded text-white">{p.type}</span>
              </div>
              <div className="text-3xl font-bold text-gameYellow">€ {p.score}</div>
              <div className="text-sm text-gray-300">Totale: € {p.totalScore}</div>
              {p.hasJolly && <div className="mt-2 text-sm font-bold text-green-400 uppercase">Jolly ★</div>}
            </div>
          ))}
        </div>

        {/* Wheel Panel */}
        <div className="flex flex-col items-center justify-center order-1 lg:order-2">
          <Wheel rotation={wheelRotation} />
          
          {state.turnState === 'waiting_spin' && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSpin}
                disabled={!isMyTurn}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold text-2xl rounded-full shadow-lg shadow-blue-500/50 uppercase tracking-widest transition-all active:scale-95"
              >
                Gira
              </button>
              <button
                onClick={() => setShowSolveModal(true)}
                disabled={!isMyTurn}
                className="px-8 py-4 bg-gameRed hover:bg-red-500 disabled:bg-gray-600 text-white font-bold text-2xl rounded-full shadow-lg shadow-red-500/50 uppercase tracking-widest transition-all active:scale-95"
              >
                Risolvi
              </button>
            </div>
          )}
        </div>

        {/* Controls / Keyboard Panel */}
        <div className="flex flex-col items-center justify-center order-3 lg:order-3">
          {state.turnState === 'waiting_letter' ? (
            <Keyboard 
              guessedConsonants={state.guessedConsonants}
              guessedVowels={state.guessedVowels}
              onLetterClick={handleLetterClick}
              disabled={!isMyTurn}
              canBuyVowel={canBuyVowel}
            />
          ) : (
            <div className="bg-white/10 p-8 rounded-xl text-center border border-white/20 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white/50 uppercase tracking-widest mb-4">
                {state.turnState === 'waiting_spin' ? 'In attesa del giro...' : 'Girando...'}
              </h3>
              {state.spinResult && (
                <div className="text-3xl font-bold text-gameYellow drop-shadow-md">
                  Risultato: {state.spinResult}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Solve Modal */}
      {showSolveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSolveSubmit} className="bg-gameBlue p-8 rounded-2xl border-4 border-gameGold w-full max-w-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-gameYellow mb-6 uppercase tracking-widest text-center">Dài la soluzione</h2>
            <input
              type="text"
              value={solveInput}
              onChange={e => setSolveInput(e.target.value)}
              className="w-full p-4 text-2xl font-bold text-black uppercase rounded mb-6 text-center"
              placeholder="Scrivi qui..."
              autoFocus
            />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowSolveModal(false)} className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xl rounded uppercase">Annulla</button>
              <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded uppercase">Conferma</button>
            </div>
          </form>
        </div>
      )}

      {/* Round/Game Over Overlay */}
      {(state.status === 'round_over' || state.status === 'game_over') && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <h1 className="text-6xl font-bold text-gameYellow mb-4 uppercase tracking-widest text-center drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
            {state.status === 'game_over' ? 'Partita Finita!' : 'Round Terminato!'}
          </h1>
          <h2 className="text-4xl text-white mb-12 text-center">
            Il vincitore è {state.players.find(p => p.id === state.winnerId)?.name}!
          </h2>
          
          <div className="bg-white/10 p-8 rounded-2xl border border-white/20 mb-12 w-full max-w-xl">
            <h3 className="text-2xl font-bold text-gameGold mb-6 uppercase tracking-widest text-center border-b border-white/10 pb-4">Classifica</h3>
            {state.players.sort((a,b) => b.totalScore - a.totalScore).map((p, i) => (
              <div key={p.id} className="flex justify-between items-center mb-4 text-xl font-bold text-white">
                <span className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-gameYellow text-black flex items-center justify-center text-sm">{i+1}</span>
                  {p.name}
                </span>
                <span className="text-green-400">€ {p.totalScore}</span>
              </div>
            ))}
          </div>

          {state.status === 'round_over' ? (
            <button 
              onClick={() => dispatch({ type: 'NEXT_ROUND' })}
              className="px-12 py-4 bg-gameYellow text-black hover:bg-yellow-300 font-bold text-2xl rounded-full shadow-lg uppercase tracking-widest transition-all active:scale-95"
            >
              Prossimo Round
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-4 bg-gameRed text-white hover:bg-red-500 font-bold text-2xl rounded-full shadow-lg uppercase tracking-widest transition-all active:scale-95"
            >
              Nuova Partita
            </button>
          )}
        </div>
      )}
    </div>
  );
};
