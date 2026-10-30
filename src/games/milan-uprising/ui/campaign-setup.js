import { buildCampaignArrangement } from '../campaign-setup.js';

export function mountCampaignSetup(profile, tabletop, onApplied) {
  const container = document.getElementById('campaign-setup');
  container.hidden = !profile.campaignSetup;
  container.replaceChildren();
  if (!profile.campaignSetup) return;
  const text = (tag, value) => { const el = document.createElement(tag); el.textContent = value; return el; };
  const select = (entries, emptyLabel) => {
    const el = document.createElement('select');
    for (const [value, label] of [['', emptyLabel], ...entries]) {
      const option = text('option', label); option.value = value; el.append(option);
    }
    return el;
  };
  const field = (labelText, control) => {
    const label = text('label', labelText); control.setAttribute('aria-label', labelText); label.append(control); return label;
  };
  const details = title => { const el = document.createElement('details'); el.append(text('summary', title)); return el; };
  const allZones = profile.zones.map(z => [z.id, z.label]);
  const city = profile.zones.filter(z => z.area === 'city');
  const cityEntries = city.map(z => [z.id, z.label]);
  const characterEntries = profile.components.filter(c => c.groupId === 'characters').map(c => [c.id, c.label]);
  container.append(text('h2', 'Copy campaign setup'));
  container.append(text('p', 'Copy positions and quantities from the official app. There is no verified default starting setup. Applying replaces all placements and token sides as one undoable action; unspecified components remain in stock.'));
  const form = document.createElement('form');
  const characterSection = details('1 · Four characters and starting positions'); characterSection.open = true;
  const characters = Array.from({ length: 4 }, (_, index) => {
    const row = document.createElement('div'); row.className = 'setup-character';
    const component = select(characterEntries, 'Choose a character');
    const zone = select(allZones, 'Starting location shown by the app');
    row.append(field(`Character ${index + 1}`, component), field(`Starting location ${index + 1}`, zone));
    characterSection.append(row); return { component, zone };
  });
  form.append(characterSection);
  const locationSection = details('2 · Influence, control and restricted locations');
  const scroll = document.createElement('div'); scroll.className = 'setup-scroll';
  const table = document.createElement('table');
  const head = document.createElement('thead'), heading = document.createElement('tr');
  for (const label of ['District', 'Anarchs', 'Camarilla', 'St. Ambrose', 'Control', 'Restricted']) heading.append(text('th', label));
  head.append(heading); table.append(head);
  const body = document.createElement('tbody');
  const locations = city.map(zone => {
    const row = document.createElement('tr'); row.append(text('th', zone.label));
    const influence = {};
    for (const [key, label] of [['anarchs', 'Anarchs'], ['camarilla', 'Camarilla'], ['ambrose', 'St. Ambrose']]) {
      const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.max = '3'; input.step = '1'; input.value = '0'; input.required = true;
      input.setAttribute('aria-label', `${zone.label}: ${label} influence`);
      const cell = document.createElement('td'); cell.append(input); row.append(cell); influence[key] = input;
    }
    const control = select([['none', 'No token'], ['anarchs', 'Anarchs'], ['camarilla', 'Camarilla'], ['ambrose', 'St. Ambrose']], 'Choose control'); control.value = 'none';
    control.setAttribute('aria-label', `${zone.label}: control`);
    const restricted = document.createElement('input'); restricted.type = 'checkbox'; restricted.setAttribute('aria-label', `${zone.label}: restricted`);
    for (const input of [control, restricted]) { const cell = document.createElement('td'); cell.append(input); row.append(cell); }
    body.append(row); return { zoneId: zone.id, influence, control, restricted };
  });
  table.append(body); scroll.append(table); locationSection.append(scroll); form.append(locationSection);
  const otherSection = details('3 · NPCs, Allies, Ghouls and Masquerade');
  const otherPieces = profile.components.filter(c => ['allies', 'ghouls', 'npcs'].includes(c.groupId)).map(component => {
    const zone = select(cityEntries, 'In stock');
    otherSection.append(field(component.label, zone)); return { componentId: component.id, zone };
  });
  const masquerade = select(cityEntries, 'In stock'); otherSection.append(field('Masquerade Encounter', masquerade)); form.append(otherSection);
  const button = text('button', 'Apply setup'); button.type = 'submit'; form.append(button);
  const status = text('p', 'No campaign setup applied yet.'); status.id = 'setup-status'; status.setAttribute('role', 'status'); form.append(status);
  form.onsubmit = event => {
    event.preventDefault();
    try {
      const arrangement = buildCampaignArrangement(profile, {
        characters: characters.map(row => ({ componentId: row.component.value, zoneId: row.zone.value })),
        locations: locations.map(row => ({ zoneId: row.zoneId, influence: Object.fromEntries(Object.entries(row.influence).map(([key, input]) => [key, Number(input.value)])), control: row.control.value, restricted: row.restricted.checked })),
        otherPieces: otherPieces.filter(row => row.zone.value).map(row => ({ componentId: row.componentId, zoneId: row.zone.value })), masqueradeZoneId: masquerade.value
      });
      tabletop.arrange(arrangement); onApplied();
      status.textContent = 'Setup applied. This is a manual transcription, not a verified official starting setup.';
    } catch (error) { status.textContent = `Setup not applied: ${error.message}`; }
  };
  container.append(form);
}
