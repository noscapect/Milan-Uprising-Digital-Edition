import { withArtwork, artworkImage } from '../presentation/artwork.js';
import { renderBoard } from '../presentation/2d/board.js';
import { installPieceDrag } from './piece-drag.js';
export function mountTabletop(tabletop, download, core = null, artwork = null, locationArtwork = false) {
  const $ = id => document.getElementById(id);
  const project = () => withArtwork(tabletop.project(), artwork, { locationArtwork });
  const initial = project();
  let selectedZone = null, placing = Boolean(core), zoom = 1, mapFailed = false;
  let drag=null,pendingUpdate=false,dropBusy=false;
  const tabs = [...document.querySelectorAll('[role=tab]')];
  function showPanel(name, focus = false) {
    for (const tab of tabs) {
      const active = tab.dataset.panel === name;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      $(`panel-${tab.dataset.panel}`).hidden = !active;
      if (active && focus) tab.focus();
    }
  }
  for (const tab of tabs) {
    tab.onclick = () => showPanel(tab.dataset.panel);
    tab.onkeydown = event => {
      const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? (index+1)%tabs.length : event.key === 'ArrowLeft' ? (index+tabs.length-1)%tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : null;
      if (next !== null) { event.preventDefault(); showPanel(tabs[next].dataset.panel, true); }
    };
  }
  showPanel('stock');
  const mapUrl = artwork?.assets?.[artwork?.branding?.map];
  const physicalAvailable = () => locationArtwork && Boolean(mapUrl) && !mapFailed;
  const mapOption = $('board-view').querySelector('[value=map]');
  mapOption.disabled = !physicalAvailable();
  $('board-view').value = physicalAvailable() ? 'map' : 'grid';
  function resizeBoard() {
    const physical = $('board').dataset.layout === 'physical-map';
    for (const id of ['zoom-out','zoom-in','fit-board']) $(id).disabled = !physical;
    $('zoom-label').textContent = physical ? `${Math.round(zoom * 100)}%` : '—';
    if (!physical) return;
    const viewport = $('board-viewport');
    const fit = Math.min(viewport.clientWidth, viewport.clientHeight * 2048/1295);
    $('board').style.width = `${Math.max(1,fit * zoom)}px`;
    $('zoom-out').disabled = zoom <= 1; $('zoom-in').disabled = zoom >= 3;
  }
  const observer = new ResizeObserver(resizeBoard); observer.observe($('board-viewport'));
  function changeZoom(value) {
    const viewport = $('board-viewport');
    const centerX = (viewport.scrollLeft + viewport.clientWidth/2) / Math.max(1,viewport.scrollWidth);
    const centerY = (viewport.scrollTop + viewport.clientHeight/2) / Math.max(1,viewport.scrollHeight);
    zoom = Math.max(1,Math.min(3,value)); resizeBoard();
    viewport.scrollLeft = viewport.scrollWidth * centerX - viewport.clientWidth/2;
    viewport.scrollTop = viewport.scrollHeight * centerY - viewport.clientHeight/2;
  }
  $('zoom-out').onclick = () => changeZoom(zoom - .25);
  $('zoom-in').onclick = () => changeZoom(zoom + .25);
  $('fit-board').onclick = () => changeZoom(1);
  $('board-view').onchange = () => { zoom = 1; update(); };
  $('focus-board').onclick = () => {
    const active = document.body.classList.toggle('board-focus');
    $('focus-board').setAttribute('aria-pressed',String(active)); resizeBoard();
  };
  function selectComponent(id, arm = true) {
    $('piece').value = id; placing = core ? true : arm; showPanel('stock'); update();
  }
  function inspectZone(id) { selectedZone = id; showPanel('location'); update(); }
  function handleZone(id) {
    selectedZone = id;
    if (!placing && !core) { inspectZone(id); return; }
    const label = initial.zones.find(zone => zone.id === id)?.label || id;
    act(() => core ? core.touch(id) : tabletop.place($('piece').value,id), core ? `Demo-interactie op ${label}. Maak het sensorcontact vrij.` : `Geplaatst op ${label}.`);
  }
  $('mode-inspect').onclick = () => { placing = false; update(); };
  $('mode-place').onclick = $('place-selected').onclick = () => { placing = true; update(); };
  $('place-in-location').onclick = () => {
    if (selectedZone) act(() => tabletop.place($('piece').value,selectedZone), `Geplaatst op ${initial.zones.find(z=>z.id===selectedZone)?.label}.`);
  };
  const cancelPlacement = event => {
    if (event.key === 'Escape' && !document.querySelector('dialog[open]')) { placing = Boolean(core); update(); }
  };
  document.addEventListener('keydown',cancelPlacement);
  $('artwork-status').textContent = artwork?.available ? 'Origineel artwork uit de lokaal geïnstalleerde app · alleen op deze computer' : 'Geen lokaal artwork gevonden. De tafel werkt met symbolen.';
  const logo = artwork?.assets?.[artwork?.branding?.logo];
  $('game-logo').hidden = !logo;
  if (logo) { $('game-logo').src = logo; $('game-logo').onerror = () => { $('game-logo').hidden = true; }; }
  const map = artwork?.assets?.[artwork?.branding?.map];
  $('map-reference').hidden = !map || !locationArtwork;
  if (map) $('original-map').src = map;
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
  $('inventory-note').textContent = initial.title ? 'Namen en aantallen zijn brongecontroleerd voor retail. Artwork is optioneel lokaal; zonder afbeeldingen gebruiken we symbolen. Lege starttafel en zonecapaciteit zijn werktafelkeuzes; volg voor de opstelling de app.' : 'Neutrale werkvoorraad. Aantallen en zonecapaciteit zijn geen geverifieerde Milan-inventaris of spelregels.';
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
    if(drag?.active){pendingUpdate=true;return;}
    const view = project();
    const physical = $('board-view').value === 'map' && physicalAvailable();
    renderBoard($('board'), view, handleZone, {
      map:physical ? mapUrl : null, selectedZone, selectedComponent:$('piece').value,
      onComponent:(id,zoneId) => placing ? handleZone(zoneId) : selectComponent(id,false), onInspect:inspectZone,
      onMapError:() => { mapFailed = true; mapOption.disabled = true; $('board-view').value = 'grid'; update(); }
    });
    $('map-caption').textContent = physical ? 'Originele kaart · klik een district' : 'Schematische weergave';
    $('mode-inspect').setAttribute('aria-pressed',String(!placing));
    $('mode-place').setAttribute('aria-pressed',String(placing));
    $('board').classList.toggle('placing',placing);
    $('tool-hint').textContent = placing ? 'Klik de bestemming op het bord. Esc om te stoppen.' : 'Sleep een pion naar een locatie, of klik een district om het te bekijken.';
    resizeBoard();
    const positions = new Map(view.zones.flatMap(zone => zone.occupants.map(c => [c.id, zone.id])));
    const locationLabel = componentId => view.zones.find(zone => zone.id === positions.get(componentId))?.label || 'in voorraad';
    const selected = view.components.find(c => c.id === $('piece').value);
    $('selection-status').textContent = `${selected.label}${selected.faceLabel ? ` · ${selected.faceLabel}` : ''} · ${locationLabel(selected.id)}`;
    const zone = view.zones.find(z=>z.id === selectedZone);
    $('location-title').textContent = zone?.label || 'Kies een district';
    $('location-image').hidden = !zone?.background;
    if (zone?.background) { $('location-image').src = zone.background; $('location-image').onerror = () => { $('location-image').hidden = true; }; }
    $('location-description').textContent = zone ? `${zone.occupants.length} onderdelen op deze locatie${zone.area === 'haven' ? ' · Haven' : ''}` : 'Klik op de kaart om onderdelen op die locatie te bekijken.';
    $('place-in-location').hidden = !zone || Boolean(core);
    $('place-in-location').textContent = `Plaats ${selected.shortLabel || selected.label} hier`;
    $('location-pieces').replaceChildren(...(zone?.occupants || []).map(component => {
      const button = document.createElement('button'); button.type = 'button';
      button.dataset.component=component.id;button.dataset.movable=String(component.kind==='piece');
      if (component.icon) button.append(artworkImage(component.icon,'inventory-icon'));
      const label = document.createElement('span'); label.textContent = `${component.label}${component.faceLabel ? ` · ${component.faceLabel}` : ''}`;
      button.append(label); button.onclick = () => selectComponent(component.id,false); return button;
    }));
    $('component-description').textContent = view.componentGroups.find(group => group.id === selected.groupId)?.description || '';
    $('component-artwork').replaceChildren(...(selected.portrait || selected.icon ? [artworkImage(selected.portrait || selected.icon, 'selected-portrait')] : []));
    $('flip').disabled = Boolean(core) || !selected.faces;
    $('stock-count').textContent = `${view.components.length - positions.size} in voorraad · ${positions.size} op het bord`;
    const activeInventory = document.activeElement?.dataset.component;
    const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl');
    const query = normalized($('inventory-search').value.trim());
    const filtered = view.components.filter(component => ($('inventory-group').value === 'all' || component.groupId === $('inventory-group').value) && normalized(`${component.label} ${component.faceLabel || ''}`).includes(query));
    $('inventory-count').textContent = filtered.length ? `${filtered.length} onderdelen getoond` : 'Geen onderdelen gevonden. Pas de categorie of zoekterm aan.';
    $('inventory').replaceChildren(...filtered.map(component => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.component = component.id;
      button.dataset.movable=String(component.kind==='piece');
      button.className = `inventory-piece ${component.kind}`;
      const text = document.createElement('span'); text.className = 'inventory-text';
      const name = document.createElement('span'); name.textContent = `${initial.title ? component.label : component.shortLabel || component.label}${component.faceLabel ? ` · ${component.faceLabel}` : ''}`;
      const position = document.createElement('small'); position.textContent = locationLabel(component.id);
      text.append(name,position); button.append(text);
      if (component.icon) button.prepend(artworkImage(component.icon, 'inventory-icon'));
      button.title = `${component.label}${component.faceLabel ? ` · ${component.faceLabel}` : ''}`;
      if (component.color) button.style.borderLeft = `5px solid ${component.color}`;
      button.setAttribute('aria-label', `${button.title}, ${locationLabel(component.id)}`);
      button.setAttribute('aria-pressed', String(component.id === selected.id));
      button.onclick = () => selectComponent(component.id);
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
  async function act(action, message) {
    try { await action(); update(); $('status').textContent = message; }
    catch (error) { $('status').textContent = error.message; }
  }
  $('register').onclick = () => act(() => core?.register($('piece').value), 'Demopion geselecteerd voor sensorinvoer. Dit is geen RFID-scan.');
  $('release').onclick = () => act(() => core?.release(), 'Sensorcontact vrij; de logische spelpositie blijft bewaard.');
  $('piece').onchange = () => {
    $('inventory-group').value = initial.components.find(component => component.id === $('piece').value)?.groupId || 'all';
    $('inventory-search').value = ''; placing = true; update();
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
  const unsubscribe = tabletop.subscribe(update);
  drag=installPieceDrag({board:$('board'),sources:[$('board'),$('inventory'),$('location-pieces')],
    canDrag:id=>core?'Gebruik de sensorbediening in deze studie.':dropBusy?'Wacht tot de vorige verplaatsing is verwerkt.':tabletop.canMove?.(id)??true,
    onStart:id=>{$('piece').value=id;placing=false;$('status').textContent='Sleep naar de bestemming; laat daar de linkermuisknop los.';},
    onEnd:()=>{if(pendingUpdate){pendingUpdate=false;update();}},
    onHint:message=>{$('status').textContent=message;},
    onDrop:async(id,zoneId)=>{dropBusy=true;selectedZone=zoneId;try{await act(()=>tabletop.place(id,zoneId),`Geplaatst op ${initial.zones.find(z=>z.id===zoneId)?.label||zoneId}.`);}finally{dropBusy=false;update();}}
  });
  update.dispose = () => { drag.dispose();unsubscribe(); observer.disconnect(); document.removeEventListener('keydown',cancelPlacement); };
  update();
  return update;
}
