import { parseCoord, formatCoord } from './coordinateUtils.js';
import { CSS_COLORS } from './cssColors.js';

export const PALETTE = [
  'red', 'orange', 'yellow', 'green', 'blue',
  'darkblue', 'purple', 'pink', 'teal', 'lightgray',
  'black', 'white',
];

const COLOR_ALIASES = {
  'dark blue': 'darkblue',
  'dark-blue': 'darkblue',
  'light gray': 'lightgray',
  'light grey': 'lightgray',
  'light-gray': 'lightgray',
  'light-grey': 'lightgray',
};

function normalizeColor(raw) {
  const lower = raw.toLowerCase().trim();
  // Try alias map first, then strip spaces (handles Whisper multi-word: "sky blue" → "skyblue")
  return COLOR_ALIASES[lower] ?? lower.replace(/\s+/g, '');
}

function validateColor(color) {
  if (!CSS_COLORS.has(color)) return `"${color}" is not a recognized CSS color name`;
  return null;
}

function normalizeInput(str) {
  return str
    .toLowerCase()
    .trim()
    // strip trailing punctuation Whisper adds (periods, commas, question marks)
    .replace(/[.,!?]+$/, '')
    .replace(/\s+/g, ' ')
    // replace arrow symbol with " to "
    .replace(/→/g, ' to ')
    // strip filler words from speech
    .replace(/\b(um|uh|please|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// coord regex fragment: single letter + single digit (A-J, 1-8)
const C = '([a-j]\\d)';

const PATTERNS = [
  // "draw line from A1 to D4" — uses activeColor
  {
    regex: new RegExp(`^draw\\s+line\\s+from\\s+${C}\\s+to\\s+${C}$`, 'i'),
    build: (m) => {
      const from = parseCoord(m[1]);
      const to = parseCoord(m[2]);
      if (!from || !to) return { error: `Invalid coordinates: ${m[1]}, ${m[2]}` };
      return {
        type: 'DRAW_LINE',
        from,
        to,
        description: `line from ${m[1].toUpperCase()} to ${m[2].toUpperCase()}`,
      };
    },
  },

  // "fill blue C2 to E3"
  {
    regex: new RegExp(`^fill\\s+(\\w+(?:\\s+\\w+)?)\\s+${C}\\s+to\\s+${C}$`, 'i'),
    build: (m) => {
      const color = normalizeColor(m[1]);
      const colorErr = validateColor(color); if (colorErr) return { error: colorErr };
      const from = parseCoord(m[2]);
      const to = parseCoord(m[3]);
      if (!from || !to) return { error: `Invalid coordinates: ${m[2]}, ${m[3]}` };
      const count = (Math.abs(to.col - from.col) + 1) * (Math.abs(to.row - from.row) + 1);
      return {
        type: 'FILL_RECT',
        color,
        from,
        to,
        description: `fill ${color} ${m[2].toUpperCase()}–${m[3].toUpperCase()} (${count} cells)`,
      };
    },
  },

  // "erase A1 to C3" — must come BEFORE single erase
  {
    regex: new RegExp(`^erase\\s+${C}\\s+to\\s+${C}$`, 'i'),
    build: (m) => {
      const from = parseCoord(m[1]);
      const to = parseCoord(m[2]);
      if (!from || !to) return { error: `Invalid coordinates: ${m[1]}, ${m[2]}` };
      return {
        type: 'ERASE_RECT',
        from,
        to,
        description: `erase ${m[1].toUpperCase()}–${m[2].toUpperCase()}`,
      };
    },
  },

  // "erase B3"
  {
    regex: new RegExp(`^erase\\s+${C}$`, 'i'),
    build: (m) => {
      const coord = parseCoord(m[1]);
      if (!coord) return { error: `Invalid coordinate: ${m[1]}` };
      return {
        type: 'ERASE',
        ...coord,
        description: `erase ${m[1].toUpperCase()}`,
      };
    },
  },

  // "place red at B3"
  {
    regex: new RegExp(`^place\\s+(\\w+(?:\\s+\\w+)?)\\s+at\\s+${C}$`, 'i'),
    build: (m) => {
      const color = normalizeColor(m[1]);
      const colorErr = validateColor(color); if (colorErr) return { error: colorErr };
      const coord = parseCoord(m[2]);
      if (!coord) return { error: `Invalid coordinate: ${m[2]}` };
      return {
        type: 'PLACE',
        color,
        ...coord,
        description: `place ${color} at ${m[2].toUpperCase()}`,
      };
    },
  },

  // "set color red"
  {
    regex: /^set\s+color\s+(\w+(?:\s+\w+)?)$/i,
    build: (m) => {
      const color = normalizeColor(m[1]);
      const colorErr = validateColor(color); if (colorErr) return { error: colorErr };
      return {
        type: 'SET_COLOR',
        color,
        description: `color → ${color}`,
      };
    },
  },

  // "select red"
  {
    regex: /^select\s+(\w+(?:\s+\w+)?)$/i,
    build: (m) => {
      const color = normalizeColor(m[1]);
      const colorErr = validateColor(color); if (colorErr) return { error: colorErr };
      return {
        type: 'SET_COLOR',
        color,
        description: `color → ${color}`,
      };
    },
  },

  // "load palette earth" / "load palette gray scale"
  {
    regex: /^load\s+palette\s+(\w+(?:\s+\w+)*)$/i,
    build: (m) => {
      const name = m[1].toLowerCase().replace(/\s+/g, '');
      return { type: 'LOAD_PALETTE', name, description: `palette → ${name}` };
    },
  },

  // "save palette mypalette"
  {
    regex: /^save\s+palette\s+(\w+(?:\s+\w+)*)$/i,
    build: (m) => {
      const name = m[1].toLowerCase().replace(/\s+/g, '');
      return { type: 'SAVE_PALETTE', name, description: `saved palette "${name}"` };
    },
  },

  // "new palette mypalette"
  {
    regex: /^new\s+palette\s+(\w+(?:\s+\w+)*)$/i,
    build: (m) => {
      const name = m[1].toLowerCase().replace(/\s+/g, '');
      return { type: 'NEW_PALETTE', name, description: `created palette "${name}"` };
    },
  },

  // "add red to palette"
  {
    regex: /^add\s+(\w+(?:\s+\w+)?)\s+to\s+palette$/i,
    build: (m) => {
      const color = normalizeColor(m[1]);
      const colorErr = validateColor(color); if (colorErr) return { error: colorErr };
      return {
        type: 'ADD_COLOR_TO_PALETTE',
        color,
        description: `add ${color} to palette`,
      };
    },
  },

  // "remove red from palette"
  {
    regex: /^remove\s+(\w+(?:\s+\w+)?)\s+from\s+palette$/i,
    build: (m) => {
      const color = normalizeColor(m[1]);
      const colorErr = validateColor(color); if (colorErr) return { error: colorErr };
      return {
        type: 'REMOVE_COLOR_FROM_PALETTE',
        color,
        description: `remove ${color} from palette`,
      };
    },
  },

  // "delete palette mypalette" / "delete palette gray scale"
  {
    regex: /^delete\s+palette\s+(\w+(?:\s+\w+)*)$/i,
    build: (m) => {
      const name = m[1].toLowerCase().replace(/\s+/g, '');
      return { type: 'DELETE_PALETTE', name, description: `deleted palette "${name}"` };
    },
  },

  // "undo"
  {
    regex: /^undo$/i,
    build: () => ({ type: 'UNDO', description: 'undo' }),
  },

  // "clear"
  {
    regex: /^clear$/i,
    build: () => ({ type: 'CLEAR', description: 'clear all' }),
  },
];

/**
 * Parse a raw command string into an action object.
 * Returns { type, ...payload, description } or { error: string }.
 */
export function parseCommand(raw) {
  const normalized = normalizeInput(raw);
  if (!normalized) return { error: 'Empty command' };

  for (const { regex, build } of PATTERNS) {
    const match = normalized.match(regex);
    if (match) {
      return build(match);
    }
  }

  return { error: `Unrecognized command: "${raw}"` };
}
