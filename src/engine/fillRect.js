/**
 * Returns all {col, row} points in the bounding rectangle between `from` and `to`.
 */
export function rectPoints(from, to) {
  const points = [];
  const minCol = Math.min(from.col, to.col);
  const maxCol = Math.max(from.col, to.col);
  const minRow = Math.min(from.row, to.row);
  const maxRow = Math.max(from.row, to.row);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      points.push({ col: c, row: r });
    }
  }
  return points;
}
