export const COLS = 8, ROWS = 5;
export function createBoard() { return { positions: { p1: null, p2: null, p3: null, p4: null }, events: [] }; }
export function place(state, id, x, y) {
  if (!Object.hasOwn(state.positions, id)) throw Error('Onbekende pion');
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= COLS || y < 0 || y >= ROWS) throw Error('Buiten het bord');
  if (Object.entries(state.positions).some(([key, pos]) => key !== id && pos?.x === x && pos?.y === y)) throw Error('Deze sensor is bezet');
  state.positions[id] = { x, y };
  record(state, 'demo.place', { id, x, y });
}
export function remove(state, id) {
  if (!Object.hasOwn(state.positions, id)) throw Error('Onbekende pion');
  state.positions[id] = null; record(state, 'demo.remove', { id });
}
export function record(state, type, data) { state.events.push({ sequence: state.events.length + 1, type, data, time: new Date().toISOString() }); }
