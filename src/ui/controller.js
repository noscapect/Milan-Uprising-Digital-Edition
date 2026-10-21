import { renderBoard } from '../presentation/2d/board.js';
export function mountTabletop(tabletop, download, core = null) {
  const $ = id => document.getElementById(id);
  const initial = tabletop.project();
  $('core-controls').hidden = !core;
  $('interaction-help').textContent = core ? 'Registreer een demopion, klik een sensor en maak het contact vrij. De spelpositie blijft bewaard; meerdere pionnen kunnen dezelfde demozone delen.' : 'Klik een cel om te plaatsen of verplaatsen. Dit referentieprofiel gebruikt één pion per cel.';
  $('piece').replaceChildren(...initial.components.map(component => {
    const option = document.createElement('option'); option.value = component.id; option.textContent = component.label; return option;
  }));
  function update() {
    const view = tabletop.project();
    renderBoard($('board'), view, zoneId => act(() => core ? core.touch(zoneId) : tabletop.place($('piece').value, zoneId), core ? `Demo-interactie op ${zoneId} geregistreerd. Maak nu het sensorcontact vrij.` : `Pion geplaatst op ${zoneId}.`));
    if (core) {
      const input = core.snapshot();
      const label = view.components.find(c => c.id === input.active)?.label || 'geen';
      $('core-status').textContent = `Actieve demopion: ${label}. Sensorcontact: ${input.contact || 'vrij'}.`;
    }
    $('count').textContent = view.revision;
    $('events').replaceChildren(...view.events.slice(-12).reverse().map(event => {
      const li = document.createElement('li'), p = event.payload;
      const label = view.components.find(c => c.id === p.componentId)?.label;
      li.textContent = event.type === 'component.place' ? `${label} naar ${p.zoneId}` : event.type === 'component.remove' ? `${label} verwijderd` : event.type === 'component.interact' ? `${label}: interactie in ${p.zoneId} (zonder spelregelactie)` : `Demo d${p.sides}: ${p.value}`;
      return li;
    }));
    const roll = view.events.findLast(event => event.type === 'dice.record')?.payload;
    $('roll').textContent = roll ? `d${roll.sides} → ${roll.value}` : '—';
  }
  function act(action, message) {
    try { action(); update(); $('status').textContent = message; }
    catch (error) { $('status').textContent = error.message; }
  }
  $('register').onclick = () => act(() => core?.register($('piece').value), 'Demopion geselecteerd voor sensorinvoer. Dit is geen RFID-scan.');
  $('release').onclick = () => act(() => core?.release(), 'Sensorcontact vrij; de logische spelpositie blijft bewaard.');
  $('remove').onclick = () => act(() => { if (core?.snapshot().contact) throw Error('Maak eerst het sensorcontact vrij'); tabletop.remove($('piece').value); }, 'Geselecteerde pion uit de sessie verwijderd.');
  const diceContainer = $('dice-actions');
  diceContainer.replaceChildren(...initial.dice.map(sides => {
    const button = document.createElement('button'); button.id = `d${sides}`; button.textContent = `Gooi d${sides}`;
    button.onclick = () => act(() => tabletop.roll(sides), 'Demo-worp geregistreerd.'); return button;
  }));
  $('reset').onclick = () => act(() => { tabletop.reset(); core?.reset(); }, 'Bord en activiteiten geleegd.');
  $('export').onclick = () => act(() => download({ ...tabletop.exportSession(), ...(core ? { inputSimulation:core.snapshot() } : {}) }), 'Sessie geëxporteerd. Import volgt later.');
  update();
}
