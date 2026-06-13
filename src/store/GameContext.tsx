import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState } from '../types';
import { gameReducer, initialGameState, GameAction } from '../lib/gameLogic';
import { getBotAction } from '../lib/botLogic';
import { WEDGE_VALUES } from '../components/Wheel';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Bot effect
  useEffect(() => {
    const action = getBotAction(state);
    if (action) {
      // Simulate bot thinking time
      const timer = setTimeout(() => {
        if (action.type === 'SPIN_WHEEL') {
          dispatch(action);
          // Simulate wheel stopping
          setTimeout(() => {
            const result = WEDGE_VALUES[Math.floor(Math.random() * WEDGE_VALUES.length)];
            dispatch({ type: 'WHEEL_STOPPED', payload: { result } });
          }, 4000); // 4 seconds spin
        } else {
          dispatch(action);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayerIndex, state.turnState, state.status, state.difficulty]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
