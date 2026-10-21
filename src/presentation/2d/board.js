export function renderBoard(container, projection, onZone) {
  const columns = projection.presentation?.columns;
  if (!Number.isInteger(columns) || columns < 1 || columns > 40) throw Error('Ongeldige 2D-indeling');
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  // Reuse cells to preserve keyboard focus across state changes.
  const existing = new Map([...container.children].map(cell => [cell.dataset.zone, cell]));
  const order = projection.presentation.zoneOrder;
  if (!Array.isArray(order) || order.length !== projection.zones.length || new Set(order).size !== order.length) throw Error('Ongeldige zonevolgorde');
  const cells = order.map(id => {
    const zone = projection.zones.find(z => z.id === id);
    if (!zone) throw Error('Onbekende presentatiezone');
    const cell = existing.get(id) || document.createElement('button');
    cell.dataset.zone = id; cell.className = 'cell';
    const colorIndex = projection.components.findIndex(c => c.id === zone.occupants[0]?.id);
    if (colorIndex >= 0) cell.classList.add(`p${colorIndex % 4 + 1}`);
    cell.textContent = zone.label + (zone.occupants.length ? ` · ${zone.occupants.map(c => c.label).join(', ')}` : '');
    cell.setAttribute('aria-label', `${zone.label}, ${zone.occupants.map(c => c.label).join(', ') || 'leeg'}`);
    cell.onclick = () => onZone(zone.id);
    return cell;
  });
  if (cells.some((cell, index) => container.children[index] !== cell)) container.replaceChildren(...cells);
}
