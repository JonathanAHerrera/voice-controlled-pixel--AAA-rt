import { bresenhamLine } from '../engine/drawLine.js';
import { rectPoints } from '../engine/fillRect.js';
import { MAX_UNDO } from './initialState.js';

function snapshotCells(cells) {
  return cells.map(row => [...row]);
}

function pushUndo(state) {
  const undoStack = [...state.undoStack, snapshotCells(state.cells)];
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  return undoStack;
}

function addHistory(state, commandText, description) {
  const entry = {
    id: Date.now() + Math.random(),
    commandText,
    description,
    timestamp: Date.now(),
  };
  return [entry, ...state.history].slice(0, 100); // keep last 100
}

function applyPoints(cells, points, color) {
  const next = snapshotCells(cells);
  for (const { col, row } of points) {
    if (row >= 0 && row < next.length && col >= 0 && col < next[0].length) {
      next[row][col] = color;
    }
  }
  return next;
}

export function pixelReducer(state, action) {
  switch (action.type) {

    case 'PLACE': {
      const { col, row, color, commandText = '' } = action;
      const cells = snapshotCells(state.cells);
      cells[row][col] = color;
      return {
        ...state,
        cells,
        undoStack: pushUndo(state),
        history: addHistory(state, commandText, `place ${color} at`),
        lastError: null,
      };
    }

    case 'DRAW_LINE': {
      const { from, to, color, commandText = '' } = action;
      const resolvedColor = color ?? state.activeColor;
      const points = bresenhamLine(from, to);
      return {
        ...state,
        cells: applyPoints(state.cells, points, resolvedColor),
        undoStack: pushUndo(state),
        history: addHistory(state, commandText, action.description ?? 'draw line'),
        lastError: null,
      };
    }

    case 'FILL_RECT': {
      const { from, to, color, commandText = '' } = action;
      const points = rectPoints(from, to);
      return {
        ...state,
        cells: applyPoints(state.cells, points, color),
        undoStack: pushUndo(state),
        history: addHistory(state, commandText, action.description ?? 'fill'),
        lastError: null,
      };
    }

    case 'ERASE': {
      const { col, row, commandText = '' } = action;
      const cells = snapshotCells(state.cells);
      cells[row][col] = null;
      return {
        ...state,
        cells,
        undoStack: pushUndo(state),
        history: addHistory(state, commandText, action.description ?? 'erase'),
        lastError: null,
      };
    }

    case 'ERASE_RECT': {
      const { from, to, commandText = '' } = action;
      const points = rectPoints(from, to);
      return {
        ...state,
        cells: applyPoints(state.cells, points, null),
        undoStack: pushUndo(state),
        history: addHistory(state, commandText, action.description ?? 'erase region'),
        lastError: null,
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const undoStack = [...state.undoStack];
      const cells = undoStack.pop();
      return {
        ...state,
        cells,
        undoStack,
        history: addHistory(state, 'undo', 'undo'),
        lastError: null,
      };
    }

    case 'CLEAR': {
      const emptyCells = state.cells.map(row => row.map(() => null));
      return {
        ...state,
        cells: emptyCells,
        undoStack: pushUndo(state),
        history: addHistory(state, 'clear', 'clear all'),
        lastError: null,
      };
    }

    case 'SET_COLOR': {
      return {
        ...state,
        activeColor: action.color,
        history: addHistory(state, `set color ${action.color}`, `color → ${action.color}`),
        lastError: null,
      };
    }

    case 'LOAD_PALETTE': {
      const { name } = action;
      const colors = state.palettes[name];
      if (!colors) return { ...state, lastError: `Palette "${name}" not found` };
      const activeColor = colors.includes(state.activeColor) ? state.activeColor : colors[0];
      return {
        ...state,
        activePalette: name,
        activeColor,
        history: addHistory(state, `load palette ${name}`, `palette → ${name}`),
        lastError: null,
      };
    }

    case 'SAVE_PALETTE': {
      const { name } = action;
      const colors = [...(state.palettes[state.activePalette] ?? [])];
      return {
        ...state,
        palettes: { ...state.palettes, [name]: colors },
        activePalette: name,
        history: addHistory(state, `save palette ${name}`, `saved palette "${name}"`),
        lastError: null,
      };
    }

    case 'NEW_PALETTE': {
      const { name } = action;
      return {
        ...state,
        palettes: { ...state.palettes, [name]: [state.activeColor] },
        activePalette: name,
        history: addHistory(state, `new palette ${name}`, `created palette "${name}"`),
        lastError: null,
      };
    }

    case 'ADD_COLOR_TO_PALETTE': {
      const { color } = action;
      const current = state.palettes[state.activePalette] ?? [];
      if (current.includes(color)) return { ...state, lastError: `${color} is already in this palette` };
      return {
        ...state,
        palettes: { ...state.palettes, [state.activePalette]: [...current, color] },
        history: addHistory(state, `add ${color} to palette`, `added ${color} to "${state.activePalette}"`),
        lastError: null,
      };
    }

    case 'REMOVE_COLOR_FROM_PALETTE': {
      const { color } = action;
      const current = state.palettes[state.activePalette] ?? [];
      const next = current.filter(c => c !== color);
      if (next.length === 0) return { ...state, lastError: 'Cannot remove the last color from a palette' };
      const activeColor = state.activeColor === color ? next[0] : state.activeColor;
      return {
        ...state,
        palettes: { ...state.palettes, [state.activePalette]: next },
        activeColor,
        history: addHistory(state, `remove ${color} from palette`, `removed ${color} from "${state.activePalette}"`),
        lastError: null,
      };
    }

    case 'DELETE_PALETTE': {
      const { name } = action;
      if (name === 'default') return { ...state, lastError: 'Cannot delete the default palette' };
      if (!state.palettes[name]) return { ...state, lastError: `Palette "${name}" not found` };
      const palettes = { ...state.palettes };
      delete palettes[name];
      const activePalette = state.activePalette === name ? 'default' : state.activePalette;
      const colors = palettes[activePalette];
      const activeColor = colors.includes(state.activeColor) ? state.activeColor : colors[0];
      return {
        ...state,
        palettes,
        activePalette,
        activeColor,
        history: addHistory(state, `delete palette ${name}`, `deleted palette "${name}"`),
        lastError: null,
      };
    }

    case 'SET_VOICE_STATUS': {
      return {
        ...state,
        listeningStatus: action.status,
        lastTranscript: action.transcript ?? state.lastTranscript,
      };
    }

    case 'SET_ERROR': {
      return { ...state, lastError: action.error };
    }

    default:
      return state;
  }
}
