import { renderBoard } from '../presentation/2d/board.js';
export function mountTabletop(tabletop, download, core = null) {
  const $ = id => document.getElementById(id);
  const initial = tabletop.project();
  $('core-controls').hidden = !core;
  $('board-label').textContent = initial.presentation.boardLabel || '8 × 5 sensoren';
  $('board-note').textContent = initial.presentation.boardNote || 'Sensorindeling bevestigd. Locaties en oriëntatie in Milan zijn nog niet geverifieerd.';
  $('content-info').hidden = !initial.title;
  $('content-title').textContent = initial.title;
  $('content-note').textContent = initial.contentNote;
  $('content-sources').replaceChildren(...initial.sources.map(source => {
    const link = document.createElement('a'); link.href = source.url; link.textContent = source.title;
    link.target = '_blank'; link.rel = 'noopener noreferrer'; return link;
  }));
  $('inventory-note').textContent = initial.title ? 'Namen en aantallen zijn brongecontroleerd voor retail. Symbolen zijn zelfgemaakt. Lege starttafel en zonecapaciteit zijn werktafelkeuzes; volg voor de opstelling de app.' : 'Neutrale werkvoorraad. Aantallen en zonecapaciteit zijn geen geverifieerde Milan-inventaris of spelregels.';
  $('inventory-search').value = '';
  $('inventory').dataset.catalog = String(Boolean(initial.title));
  const groups = [{ id: 'all', label: 'Alle onderdelen' }, ...initial.componentGroups];
  $('inventory-group').replaceChildren(...groups.map(group => {
    const option = document.createElement('option'); option.value = group.id;
    const count = initial.components.filter(c => group.id === 'all' || c.groupId === group.id).length;
    option.textContent = `${group.label} (${count})`; return option;
  }));
  $('inventory-group').value = initial.componentGroups[0]?.id || 'all';
  $('interaction-help').textContent = core ? 'Registreer een demopion, klik een sensor en maak het contact vrij. De spelpositie blijft bewaard; meerdere pionnen kunnen dezelfde demozone delen.' : 'Kies een onderdeel en klik een zone om het te plaatsen of verplaatsen. Terug naar voorraad haalt alleen dat onderdeel van het bord.';
  $('piece').replaceChildren(...initial.components.map(component => {
    const option = document.createElement('option'); option.value = component.id; option.textContent = component.label; return option;
  }));
  function update() {
    const view = tabletop.project();
    renderBoard($('board'), view, zoneId => act(() => core ? core.touch(zoneId) : tabletop.place($('piece').value, zoneId), core ? `Demo-interactie op ${zoneId} geregistreerd. Maak nu het sensorcontact vrij.` : `Onderdeel geplaatst op ${zoneId}.`));
    const positions = new Map(view.zones.flatMap(zone => zone.occupants.map(c => [c.id, zone.id])));
    const locationLabel = componentId => view.zones.find(zone => zone.id === positions.get(componentId))?.label || 'in voorraad';
    const selected = view.components.find(c => c.id === $('piece').value);
    $('selection-status').textContent = `${selected.label}${selected.faceLabel ? ` · ${selected.faceLabel}` : ''} · ${locationLabel(selected.id)}`;
    $('component-description').textContent = view.componentGroups.find(group => group.id === selected.groupId)?.description || '';
    $('flip').disabled = Boolean(core) || !selected.faces;
    $('stock-count').textContent = `${view.components.length - positions.size} in voorraad · ${positions.size} op het bord`;
    const activeInventory = document.activeElement?.dataset.component;
    const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl');
    const query = normalized($('inventory-search').value.trim());
    const filtered = view.components.filter(component => ($('inventory-group').value === 'all' || component.groupId === $('inventory-group').value) && normalized(`${component.label} ${component.faceLabel || ''}`).includes(query));
    $('inventory-count').textContent = filtered.length ? `${filtered.length} onderdelen getoond` : 'Geen onderdelen gevonden. Pas de categorie of zoekterm aan.';
    $('inventory').replaceChildren(...filtered.map(component => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.component = component.id;
      button.className = `inventory-piece ${component.kind}`;
      button.textContent = `${initial.title ? component.label : component.shortLabel || component.label}${component.faceLabel ? ` · ${component.faceLabel}` : ''} · ${locationLabel(component.id)}`;
      button.title = `${component.label}${component.faceLabel ? ` · ${component.faceLabel}` : ''}`;
      if (component.color) button.style.borderLeft = `5px solid ${component.color}`;
      button.setAttribute('aria-label', `${button.title}, ${locationLabel(component.id)}`);
      button.setAttribute('aria-pressed', String(component.id === selected.id));
      button.onclick = () => { $('piece').value = component.id; update(); };
      return button;
    }));
    if (activeInventory) [...$('inventory').children].find(button => button.dataset.component === activeInventory)?.focus();
    if (core) {
      const input = core.snapshot();
      const label = view.components.find(c => c.id === input.active)?.label || 'geen';
      $('core-status').textContent = `Actieve demopion: ${label}. Sensorcontact: ${input.contact || 'vrij'}.`;
    }
    $('count').textContent = view.revision;
    $('undo').disabled = Boolean(core) || !view.canUndo;
    $('redo').disabled = Boolean(core) || !view.canRedo;
    $('events').replaceChildren(...view.events.slice(-12).reverse().map(event => {
      const li = document.createElement('li'), p = event.payload;
      const label = view.components.find(c => c.id === p.componentId)?.label;
      const zoneLabel = view.zones.find(zone => zone.id === p.zoneId)?.label || p.zoneId;
      li.textContent = event.type === 'table.arrange' ? `Handmatige opstelling: ${p.placements.length} onderdelen geplaatst` : event.type === 'component.place' ? `${label} naar ${zoneLabel}` : event.type === 'component.remove' ? `${label} verwijderd` : event.type === 'component.flip' ? `${label}: fiche omgekeerd` : event.type === 'component.interact' ? `${label}: interactie in ${zoneLabel} (zonder spelregelactie)` : `Demo d${p.sides}: ${p.value}`;
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
  $('piece').onchange = () => {
    $('inventory-group').value = initial.components.find(component => component.id === $('piece').value)?.groupId || 'all';
    $('inventory-search').value = ''; update();
  };
  $('inventory-group').onchange = update;
  $('inventory-search').oninput = update;
  $('flip').onclick = () => act(() => { if (core) throw Error('Fiches omkeren is alleen beschikbaar op de handmatige tafel'); tabletop.flip($('piece').value); }, 'Fiche omgekeerd.');
  $('remove').onclick = () => act(() => { if (core?.snapshot().contact) throw Error('Maak eerst het sensorcontact vrij'); tabletop.remove($('piece').value); }, 'Geselecteerd onderdeel terug in voorraad.');
  const diceContainer = $('dice-actions');
  diceContainer.replaceChildren(...initial.dice.map(sides => {
    const button = document.createElement('button'); button.id = `d${sides}`; button.textContent = `Gooi d${sides}`;
    button.onclick = () => act(() => tabletop.roll(sides), 'Demo-worp geregistreerd.'); return button;
  }));
  $('reset').onclick = () => act(() => { tabletop.reset(); core?.reset(); }, 'Bord en activiteiten geleegd.');
  $('undo').onclick = () => act(() => { if (core) throw Error('Herstelknoppen zijn alleen beschikbaar op de handmatige tafel'); tabletop.undo(); }, 'Laatste handeling ongedaan gemaakt.');
  $('redo').onclick = () => act(() => { if (core) throw Error('Herstelknoppen zijn alleen beschikbaar op de handmatige tafel'); tabletop.redo(); }, 'Handeling opnieuw uitgevoerd met dezelfde uitkomst.');
  $('export').onclick = () => act(() => download({ ...tabletop.exportSession(), ...(core ? { inputSimulation:core.snapshot() } : {}) }), 'Sessie opgeslagen als JSON.');
  $('import').disabled = Boolean(core);
  $('session-file').value = '';
  $('import').onclick = () => $('session-file').click();
  $('session-file').onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    // Recognize a profile switch during asynchronous reading before updating the shared UI.
    const input = event.target; const readHandler = input.onchange;
    try {
      if (file.size > 2 * 1024 * 1024) throw Error('Sessiebestand is groter dan 2 MB');
      const saved = JSON.parse(await file.text());
      if (input.onchange !== readHandler) return;
      tabletop.restoreSession(saved); update(); $('status').textContent = 'Tafel hersteld uit JSON, inclusief vastgelegde worpen.';
    } catch (error) { if (input.onchange === readHandler) $('status').textContent = `Openen mislukt: ${error.message}`; }
    finally { if (input.onchange === readHandler) input.value = ''; }
  };
  update();
  return update;
}
