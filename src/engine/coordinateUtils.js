/**
 * Parse a coordinate string like "B3" into {col, row} (0-indexed).
 * Columns: A=0, B=1, ... J=9
 * Rows: 1=0, 2=1, ... 8=7
 */
export function parseCoord(str, gridCols = 10, gridRows = 8) {
  if (!str) return null;
  const match = str.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const letters = match[1];
  const num = parseInt(match[2], 10);

  // Base-26 decode for multi-letter columns (A=0, Z=25, AA=26, ...)
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  col -= 1; // convert to 0-indexed

  const row = num - 1; // convert to 0-indexed

  if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) return null;
  return { col, row };
}

/**
 * Format {col, row} back to a coordinate string like "B3".
 */
export function formatCoord(col, row) {
  let letters = '';
  let c = col + 1;
  while (c > 0) {
    const rem = (c - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    c = Math.floor((c - 1) / 26);
  }
  return `${letters}${row + 1}`;
}

/**
 * Generate column labels for a grid of given width.
 * e.g., colLabels(10) => ['A','B','C',...,'J']
 */
export function colLabels(gridCols) {
  return Array.from({ length: gridCols }, (_, i) => formatCoord(i, 0).replace(/\d+$/, ''));
}
