import { buildCampaignArrangement } from '../games/milan-uprising/campaign-setup.js';

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
  container.append(text('h2', 'Campagne-opstelling overnemen'));
  container.append(text('p', 'Neem de posities en aantallen over uit de officiële app. Dit formulier heeft geen geverifieerde vaste beginstand. Toepassen vervangt alle plaatsingen en ficheszijden als één herstelbare handeling; niet ingevulde overige onderdelen blijven in voorraad.'));
  const form = document.createElement('form');
  const characterSection = details('1 · Vier personages en startposities'); characterSection.open = true;
  const characters = Array.from({ length: 4 }, (_, index) => {
    const row = document.createElement('div'); row.className = 'setup-character';
    const component = select(characterEntries, 'Kies een personage');
    const zone = select(allZones, 'Startlocatie volgens de app');
    row.append(field(`Personage ${index + 1}`, component), field(`Startlocatie ${index + 1}`, zone));
    characterSection.append(row); return { component, zone };
  });
  form.append(characterSection);
  const locationSection = details('2 · Invloed, controle en afgesloten locaties');
  const scroll = document.createElement('div'); scroll.className = 'setup-scroll';
  const table = document.createElement('table');
  const head = document.createElement('thead'), heading = document.createElement('tr');
  for (const label of ['District', 'Anarchs', 'Camarilla', 'St. Ambrose', 'Controle', 'Afgesloten']) heading.append(text('th', label));
  head.append(heading); table.append(head);
  const body = document.createElement('tbody');
  const locations = city.map(zone => {
    const row = document.createElement('tr'); row.append(text('th', zone.label));
    const influence = {};
    for (const [key, label] of [['anarchs', 'Anarchs'], ['camarilla', 'Camarilla'], ['ambrose', 'St. Ambrose']]) {
      const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.max = '3'; input.step = '1'; input.value = '0'; input.required = true;
      input.setAttribute('aria-label', `${zone.label}: invloed ${label}`);
      const cell = document.createElement('td'); cell.append(input); row.append(cell); influence[key] = input;
    }
    const control = select([['none', 'Geen fiche'], ['anarchs', 'Anarchs'], ['camarilla', 'Camarilla'], ['ambrose', 'St. Ambrose']], 'Kies controle'); control.value = 'none';
    control.setAttribute('aria-label', `${zone.label}: controle`);
    const restricted = document.createElement('input'); restricted.type = 'checkbox'; restricted.setAttribute('aria-label', `${zone.label}: afgesloten`);
    for (const input of [control, restricted]) { const cell = document.createElement('td'); cell.append(input); row.append(cell); }
    body.append(row); return { zoneId: zone.id, influence, control, restricted };
  });
  table.append(body); scroll.append(table); locationSection.append(scroll); form.append(locationSection);
  const otherSection = details('3 · NPC’s, bondgenoten, ghouls en Masquerade');
  const otherPieces = profile.components.filter(c => ['allies', 'ghouls', 'npcs'].includes(c.groupId)).map(component => {
    const zone = select(cityEntries, 'In voorraad');
    otherSection.append(field(component.label, zone)); return { componentId: component.id, zone };
  });
  const masquerade = select(cityEntries, 'In voorraad'); otherSection.append(field('Masquerade Encounter', masquerade)); form.append(otherSection);
  const button = text('button', 'Pas ingevulde opstelling toe'); button.type = 'submit'; form.append(button);
  const status = text('p', 'Nog geen campagne-opstelling toegepast.'); status.id = 'setup-status'; status.setAttribute('role', 'status'); form.append(status);
  form.onsubmit = event => {
    event.preventDefault();
    try {
      const arrangement = buildCampaignArrangement(profile, {
        characters: characters.map(row => ({ componentId: row.component.value, zoneId: row.zone.value })),
        locations: locations.map(row => ({ zoneId: row.zoneId, influence: Object.fromEntries(Object.entries(row.influence).map(([key, input]) => [key, Number(input.value)])), control: row.control.value, restricted: row.restricted.checked })),
        otherPieces: otherPieces.filter(row => row.zone.value).map(row => ({ componentId: row.componentId, zoneId: row.zone.value })), masqueradeZoneId: masquerade.value
      });
      tabletop.arrange(arrangement); onApplied();
      status.textContent = 'Ingevulde opstelling toegepast. Dit is een handmatige overname, geen door ons geverifieerde officiële beginstand.';
    } catch (error) { status.textContent = `Opstelling niet toegepast: ${error.message}`; }
  };
  container.append(form);
}
