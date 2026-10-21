import { renderBoard } from '../presentation/2d/board.js';
export function mountTabletop(tabletop, download) {
  const $ = id => document.getElementById(id);
  const initial = tabletop.project();
  $('piece').replaceChildren(...initial.components.map(component => {
    const option = document.createElement('option'); option.value = component.id; option.textContent = component.label; return option;
  }));
  function update() {
    const view = tabletop.project();
    renderBoard($('board'), view, zoneId => act(() => tabletop.place($('piece').value, zoneId), `Pion geplaatst op ${zoneId}.`));
    $('count').textContent = view.revision;
    $('events').replaceChildren(...view.events.slice(-12).reverse().map(event => {
      const li = document.createElement('li'), p = event.payload;
      const label = view.components.find(c => c.id === p.componentId)?.label;
      li.textContent = event.type === 'component.place' ? `${label} naar ${p.zoneId}` : event.type === 'component.remove' ? `${label} verwijderd` : `Demo d${p.sides}: ${p.value}`;
      return li;
    }));
    const roll = view.events.findLast(event => event.type === 'dice.record')?.payload;
    $('roll').textContent = roll ? `d${roll.sides} → ${roll.value}` : '—';
  }
  function act(action, message) {
    try { action(); update(); $('status').textContent = message; }
    catch (error) { $('status').textContent = error.message; }
  }
  $('remove').onclick = () => act(() => tabletop.remove($('piece').value), 'Geselecteerde pion verwijderd.');
  const diceContainer = $('dice-actions');
  diceContainer.replaceChildren(...initial.dice.map(sides => {
    const button = document.createElement('button'); button.id = `d${sides}`; button.textContent = `Gooi d${sides}`;
    button.onclick = () => act(() => tabletop.roll(sides), 'Demo-worp geregistreerd.'); return button;
  }));
  $('reset').onclick = () => act(() => tabletop.reset(), 'Bord en activiteiten geleegd.');
  $('export').onclick = () => act(() => download(tabletop.exportSession()), 'Sessie geëxporteerd. Import volgt later.');
  update();
}
