export function renderBoard(container, projection, onZone) {
  const columns = projection.presentation?.columns;
  if (!Number.isInteger(columns) || columns < 1 || columns > 40) throw Error('Ongeldige 2D-indeling');
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  container.dataset.layout = projection.presentation.layout || 'grid';
  // Reuse cells to preserve keyboard focus across state changes.
  const existing = new Map([...container.children].map(cell => [cell.dataset.zone, cell]));
  const order = projection.presentation.zoneOrder;
  if (!Array.isArray(order) || order.length !== projection.zones.length || new Set(order).size !== order.length) throw Error('Ongeldige zonevolgorde');
  const cells = order.map(id => {
    const zone = projection.zones.find(z => z.id === id);
    if (!zone) throw Error('Onbekende presentatiezone');
    const cell = existing.get(id) || document.createElement('button');
    cell.dataset.zone = id; cell.className = 'cell';
    if (zone.area === 'haven') cell.classList.add('haven-zone');
    const title = document.createElement('span'); title.className = 'zone-label'; title.textContent = zone.label;
    const occupants = document.createElement('span'); occupants.className = 'zone-pieces';
    occupants.replaceChildren(...zone.occupants.map(component => {
      const piece = document.createElement('span');
      const colorIndex = projection.components.findIndex(c => c.id === component.id);
      piece.className = `board-piece ${component.kind} p${colorIndex % 4 + 1}`;
      if (component.color) piece.style.backgroundColor = component.color;
      piece.textContent = component.shortLabel || `${colorIndex + 1}`;
      piece.title = `${component.label}${component.faceLabel ? ` · ${component.faceLabel}` : ''}`;
      return piece;
    }));
    const attributes = document.createElement('span'); attributes.className = 'zone-attributes';
    const labels = { physical: 'Fysiek', mental: 'Mentaal', social: 'Sociaal' };
    attributes.textContent = (zone.attributes || []).map(attribute => labels[attribute] || attribute).join(' · ');
    cell.replaceChildren(title, attributes, occupants);
    cell.setAttribute('aria-label', `${zone.label}, ${zone.occupants.map(c => `${c.label}${c.faceLabel ? ` (${c.faceLabel})` : ''}`).join(', ') || 'leeg'}`);
    cell.onclick = () => onZone(zone.id);
    return cell;
  });
  if (cells.some((cell, index) => container.children[index] !== cell)) container.replaceChildren(...cells);
}
