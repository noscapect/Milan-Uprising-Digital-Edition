import { COLS, ROWS, createBoard, place, remove, record } from './model.js';
const $ = id => document.getElementById(id);
let state = createBoard();
const cellName = (x, y) => `${String.fromCharCode(65 + x)}${y + 1}`;
function render() {
  for (const cell of $('board').children) {
    const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
    const piece = Object.entries(state.positions).find(([, p]) => p?.x === x && p?.y === y)?.[0];
    cell.textContent = piece ? `${cellName(x,y)} · ${piece.slice(1)}` : cellName(x,y);
    cell.className = `cell ${piece || ''}`;
    cell.setAttribute('aria-label', `${cellName(x,y)}, ${piece ? `pion ${piece.slice(1)}` : 'leeg'}`);
  }
  $('count').textContent = state.events.length;
  $('events').replaceChildren(...state.events.slice(-12).reverse().map(event => {
    const li = document.createElement('li');
    const d = event.data;
    li.textContent = event.type === 'demo.place' ? `Pion ${d.id.slice(1)} naar ${cellName(d.x,d.y)}` : event.type === 'demo.remove' ? `Pion ${d.id.slice(1)} verwijderd` : `Demo d${d.sides}: ${d.value}`;
    return li;
  }));
}
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
  const button = document.createElement('button');
  button.dataset.x = x; button.dataset.y = y;
  button.onclick = () => { try { place(state, $('piece').value, x, y); $('status').textContent = `Pion geplaatst op ${cellName(x,y)}.`; render(); } catch (e) { $('status').textContent = e.message; } };
  $('board').append(button);
}
$('remove').onclick = () => { remove(state, $('piece').value); render(); $('status').textContent = 'Geselecteerde pion verwijderd.'; };
for (const sides of [6, 10]) $(`d${sides}`).onclick = () => {
  // Rejection sampling avoids modulo bias. This is a demo, not an official die.
  const buffer = new Uint32Array(1), limit = Math.floor(2 ** 32 / sides) * sides;
  do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  const value = buffer[0] % sides + 1;
  record(state, 'demo.roll', { sides, value }); $('roll').textContent = `d${sides} → ${value}`; render();
};
$('reset').onclick = () => { state = createBoard(); $('roll').textContent = '—'; $('status').textContent = 'Bord en activiteiten geleegd.'; render(); };
$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, mode: 'local-demo', geometry: { columns: COLS, rows: ROWS, mapping: 'unverified' }, ...state }, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'milan-demo.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};
render();
