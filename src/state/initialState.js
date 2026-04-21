export const GRID_COLS = 10;
export const GRID_ROWS = 8;
export const MAX_UNDO = 50;

export const PRESET_PALETTES = {
  default:   ['red', 'orange', 'yellow', 'green', 'blue', 'darkblue', 'purple', 'pink', 'teal', 'lightgray'],
  warm:      ['red', 'orange', 'yellow', 'pink'],
  cool:      ['blue', 'darkblue', 'teal', 'purple'],
  earth:     ['red', 'orange', 'yellow', 'green', 'teal'],
  grayscale: ['black', 'lightgray', 'white'],
};

export function createInitialState() {
  return {
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    cells: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null)),
    activeColor: 'red',
    palettes: { ...PRESET_PALETTES },
    activePalette: 'default',
    undoStack: [],
    history: [],
    listeningStatus: 'idle', // 'idle' | 'listening' | 'recognized' | 'error'
    lastTranscript: '',
    lastError: null,
  };
}
