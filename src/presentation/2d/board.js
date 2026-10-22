import { artworkImage } from '../artwork.js';
import { milanMap } from './milan-map.js';

function pieceElement(component, index, options, interactive = false) {
  const piece = document.createElement(interactive ? 'button' : 'span');
  if (interactive) piece.type = 'button';
  piece.className = `board-piece ${component.kind} p${index % 4 + 1}`;
  piece.dataset.component = component.id;
  if (component.color) piece.style.setProperty('--piece-color', component.color);
  const label = document.createElement('span'); label.className = 'piece-abbreviation'; label.textContent = component.shortLabel || `${index + 1}`;
  piece.append(label);
  const miniature = interactive && component.kind === 'piece' && component.portrait;
  if (miniature || component.icon) piece.prepend(artworkImage(miniature || component.icon, miniature ? 'piece-icon miniature-icon' : 'piece-icon'));
  piece.title = `${component.label}${component.faceLabel ? ` · ${component.faceLabel}` : ''}`;
  piece.setAttribute('aria-label', piece.title);
  piece.classList.toggle('selected-piece', component.id === options.selectedComponent);
  if (interactive) piece.onclick = event => { event.stopPropagation(); options.onComponent?.(component.id,options.zoneId); };
  return piece;
}

export function renderBoard(container, projection, onZone, options = {}) {
  const physical = options.map && projection.zones.every(zone => milanMap.zones[zone.id]);
  const layout = physical ? 'physical-map' : projection.presentation.layout || 'grid';
  if (container.dataset.layout !== layout) container.replaceChildren();
  container.dataset.layout = layout;
  if (physical) return renderMap(container, projection, onZone, options);
  container.style.backgroundImage = ''; container.style.width = ''; container.style.aspectRatio = '';
  const columns = projection.presentation?.columns;
  if (!Number.isInteger(columns) || columns < 1 || columns > 40) throw Error('Ongeldige 2D-indeling');
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  const existing = new Map([...container.children].map(cell => [cell.dataset.zone, cell]));
  const order = projection.presentation.zoneOrder;
  if (!Array.isArray(order) || order.length !== projection.zones.length || new Set(order).size !== order.length) throw Error('Ongeldige zonevolgorde');
  const cells = order.map(id => {
    const zone = projection.zones.find(z => z.id === id);
    if (!zone) throw Error('Onbekende presentatiezone');
    const cell = existing.get(id) || document.createElement('button');
    cell.dataset.zone = id; cell.className = 'cell'; cell.type = 'button';
    cell.classList.toggle('selected-zone', zone.id === options.selectedZone);
    cell.style.backgroundImage = zone.background ? `linear-gradient(#07101b55,#07101bd9),url("${zone.background}")` : '';
    if (zone.area === 'haven') cell.classList.add('haven-zone');
    const title = document.createElement('span'); title.className = 'zone-label'; title.textContent = zone.label;
    const occupants = document.createElement('span'); occupants.className = 'zone-pieces';
    occupants.replaceChildren(...zone.occupants.map(component => pieceElement(component, projection.components.findIndex(c => c.id === component.id), options)));
    const attributes = document.createElement('span'); attributes.className = 'zone-attributes';
    const labels = { physical:'Fysiek', mental:'Mentaal', social:'Sociaal' };
    attributes.textContent = (zone.attributes || []).map(attribute => labels[attribute] || attribute).join(' · ');
    cell.replaceChildren(title, attributes, occupants);
    cell.setAttribute('aria-label', zoneDescription(zone));
    cell.onclick = () => onZone(zone.id);
    return cell;
  });
  if (cells.some((cell, index) => container.children[index] !== cell)) container.replaceChildren(...cells);
}
const zoneDescription = zone => `${zone.label}, ${zone.occupants.map(c => `${c.label}${c.faceLabel ? ` (${c.faceLabel})` : ''}`).join(', ') || 'leeg'}`;

function renderMap(container, projection, onZone, options) {
  container.style.gridTemplateColumns = ''; container.style.aspectRatio = `${milanMap.width} / ${milanMap.height}`;
  let background = container.querySelector('.map-artwork');
  if (!background) {
    background = document.createElement('img'); background.className = 'map-artwork'; background.alt = ''; background.draggable = false;
    background.onerror = options.onMapError; container.prepend(background);
  }
  if (background.getAttribute('src') !== options.map) background.src = options.map;
  const existing = new Map([...container.querySelectorAll('.map-zone')].map(zone => [zone.dataset.zone,zone]));
  for (const zone of projection.zones) {
    const geometry = milanMap.zones[zone.id];
    let wrapper = existing.get(zone.id);
    if (!wrapper) {
      wrapper = document.createElement('div'); wrapper.className = 'map-zone'; wrapper.dataset.zone = zone.id;
      const hit = document.createElement('button'); hit.type = 'button'; hit.className = 'cell'; hit.dataset.zone = zone.id;
      const content = document.createElement('div'); content.className = 'map-zone-content';
      const label = document.createElement('span'); label.className = 'zone-label'; label.textContent = zone.label;
      const pieces = document.createElement('span'); pieces.className = 'zone-pieces';
      content.append(label,pieces); wrapper.append(hit,content); container.append(wrapper);
      const xs=geometry.polygon.map(p=>p[0]), ys=geometry.polygon.map(p=>p[1]);
      const x=Math.min(...xs), y=Math.min(...ys), w=Math.max(...xs)-x, h=Math.max(...ys)-y;
      Object.assign(hit.style,{left:`${x / milanMap.width * 100}%`,top:`${y / milanMap.height * 100}%`,width:`${w / milanMap.width * 100}%`,height:`${h / milanMap.height * 100}%`,clipPath:`polygon(${geometry.polygon.map(p=>`${(p[0]-x)/w*100}% ${(p[1]-y)/h*100}%`).join(',')})`});
      Object.assign(content.style,{left:`${geometry.anchor[0] / milanMap.width * 100}%`,top:`${geometry.anchor[1] / milanMap.height * 100}%`});
    }
    wrapper.classList.toggle('selected-zone', zone.id === options.selectedZone);
    const hit = wrapper.querySelector('.cell'); hit.setAttribute('aria-label', zoneDescription(zone)); hit.title = zone.label;
    hit.onclick = () => onZone(zone.id);
    const pieces = wrapper.querySelector('.zone-pieces');
    const active = document.activeElement?.closest('.board-piece')?.dataset.component;
    pieces.replaceChildren(...zone.occupants.slice(0,4).map(component => pieceElement(component,projection.components.findIndex(c=>c.id===component.id),{...options,zoneId:zone.id},true)));
    if (zone.occupants.length > 4) {
      const more=document.createElement('button'); more.type='button'; more.className='piece-overflow'; more.textContent=`+${zone.occupants.length-4}`;
      more.setAttribute('aria-label',`${zone.label}: toon alle ${zone.occupants.length} onderdelen`); more.onclick=()=>options.onInspect?.(zone.id); pieces.append(more);
    }
    if (active) [...pieces.children].find(piece=>piece.dataset.component===active)?.focus({preventScroll:true});
  }
}
