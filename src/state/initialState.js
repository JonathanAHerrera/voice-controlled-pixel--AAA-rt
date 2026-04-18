export const GRID_COLS = 10;
export const GRID_ROWS = 8;
export const MAX_UNDO = 50;

export function createInitialState() {
  return {
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    cells: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null)),
    activeColor: 'red',
    undoStack: [],
    history: [],
    listeningStatus: 'idle', // 'idle' | 'listening' | 'recognized' | 'error'
    lastTranscript: '',
    lastError: null,
  };
}
