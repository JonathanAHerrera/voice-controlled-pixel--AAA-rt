import { createContext, useContext, useReducer } from 'react';
import { pixelReducer } from './pixelReducer.js';
import { createInitialState } from './initialState.js';
import { parseCommand } from '../engine/commandParser.js';

const PixelContext = createContext(null);

export function PixelProvider({ children }) {
  const [state, dispatch] = useReducer(pixelReducer, undefined, createInitialState);

  function executeCommand(rawText) {
    const result = parseCommand(rawText);
    if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error });
      return false;
    }
    // Attach active color to line draws (which don't specify color in the command)
    if (result.type === 'DRAW_LINE' && !result.color) {
      result.color = state.activeColor;
    }
    dispatch({ ...result, commandText: rawText });
    return true;
  }

  return (
    <PixelContext.Provider value={{ state, dispatch, executeCommand }}>
      {children}
    </PixelContext.Provider>
  );
}

export function usePixel() {
  const ctx = useContext(PixelContext);
  if (!ctx) throw new Error('usePixel must be used inside PixelProvider');
  return ctx;
}
