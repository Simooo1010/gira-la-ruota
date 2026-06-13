import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { PlayerType, Language, Difficulty, GameMode } from '../types';

export const Lobby = () => {
  const { state, dispatch } = useGame();
  
  const [playerName, setPlayerName] = useState('');
  const [playerType, setPlayerType] = useState<PlayerType>('human');
  
  const handleAddPlayer = () => {
    if (!playerName.trim() && playerType === 'human') return;
    const name = playerType === 'bot' ? `Bot ${state.players.length + 1}` : playerName;
    dispatch({ 
      type: 'ADD_PLAYER', 
      payload: { id: Date.now().toString(), name, type: playerType, score: 0, totalScore: 0, hasJolly: false, connected: true } 
    });
    setPlayerName('');
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.players.length !== 3) {
      alert("Devono esserci esattamente 3 giocatori!");
      return;
    }
    const fd = new FormData(e.target as HTMLFormElement);
    dispatch({
      type: 'START_GAME',
      payload: {
        mode: fd.get('mode') as GameMode,
        language: fd.get('language') as Language,
        difficulty: fd.get('difficulty') as Difficulty
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gameBlue/90 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-gameGold text-white mt-10">
      <h1 className="text-5xl md:text-6xl font-bold text-center mb-8 text-gameYellow drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wider">
        GIRA LA RUOTA SHOW
      </h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-gameGold pb-2">Giocatori ({state.players.length}/3)</h2>
          <ul className="space-y-2 mb-6">
            {state.players.map((p, i) => (
              <li key={i} className="bg-white/10 p-3 rounded flex justify-between items-center font-bold text-lg">
                <span>{p.name}</span>
                <span className="text-sm bg-gameYellow text-black px-2 py-1 rounded uppercase tracking-wider">{p.type}</span>
              </li>
            ))}
            {state.players.length === 0 && <p className="text-gray-300 italic">Nessun giocatore aggiunto.</p>}
          </ul>
          
          {state.players.length < 3 && (
            <div className="bg-white/5 p-4 rounded-xl border border-white/20">
              <h3 className="text-lg font-bold mb-3">Aggiungi Giocatore</h3>
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={() => setPlayerType('human')}
                  className={`flex-1 py-2 rounded font-bold transition-all ${playerType === 'human' ? 'bg-gameYellow text-black' : 'bg-white/20 hover:bg-white/30'}`}
                >Umano</button>
                <button 
                  onClick={() => setPlayerType('bot')}
                  className={`flex-1 py-2 rounded font-bold transition-all ${playerType === 'bot' ? 'bg-gameYellow text-black' : 'bg-white/20 hover:bg-white/30'}`}
                >Bot</button>
              </div>
              {playerType === 'human' && (
                <input 
                  type="text" 
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Nome giocatore..."
                  className="w-full p-2 rounded bg-white text-black font-bold mb-3"
                  maxLength={15}
                />
              )}
              <button 
                onClick={handleAddPlayer}
                className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded uppercase tracking-wider transition-all active:scale-95"
              >
                Aggiungi
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleStart} className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-2 border-b-2 border-gameGold pb-2">Impostazioni Partita</h2>
          
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Modalità</label>
            <select name="mode" className="w-full p-3 rounded bg-white text-black font-bold text-lg cursor-pointer">
              <option value="1_round">Round Singolo (Veloce)</option>
              <option value="half_game">Mezza Partita (3 Round)</option>
              <option value="full_game">Partita Completa (5 Round)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Lingua Frasi</label>
            <select name="language" className="w-full p-3 rounded bg-white text-black font-bold text-lg cursor-pointer">
              <option value="it">Italiano 🇮🇹</option>
              <option value="en">English 🇬🇧</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Intelligenza Bot & Frasi</label>
            <select name="difficulty" className="w-full p-3 rounded bg-white text-black font-bold text-lg cursor-pointer">
              <option value="easy">Facile (Bot casuali, Frasi semplici)</option>
              <option value="medium">Medio (Bot furbi, Frasi normali)</option>
              <option value="hard">Difficile (Bot implacabili, Frasi difficili)</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={state.players.length !== 3}
            className="mt-auto py-4 bg-gameRed hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-gameRed/50"
          >
            Inizia a Giocare
          </button>
        </form>
      </div>
    </div>
  );
};
