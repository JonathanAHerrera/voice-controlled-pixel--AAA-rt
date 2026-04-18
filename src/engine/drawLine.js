/**
 * Bresenham's line algorithm.
 * Returns an array of {col, row} points from `from` to `to` (inclusive).
 */
export function bresenhamLine(from, to) {
  const points = [];
  let { col: x0, row: y0 } = from;
  const { col: x1, row: y1 } = to;

  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    points.push({ col: x0, row: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }

  return points;
}
